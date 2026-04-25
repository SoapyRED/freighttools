/**
 * Edge Middleware — three concerns:
 *
 * 1. SCRAPE PROTECTION (page routes)
 *    HS routes (/hs/heading/*, /hs/code/*, /hs/section/*, /hs/chapter/*):
 *      10 requests per 5 minutes per IP — tight, scraper is slow-crawling
 *    ADR routes (/adr/un/*):
 *      30 requests per minute per IP — lighter pressure
 *    Why: Sequential scrapers are crawling data pages, burning Vercel credits.
 *
 * 2. SCRAPE PROTECTION (bulk-reference API endpoints)
 *    Routes: /api/airlines, /api/unlocode, /api/hs, /api/adr (and sub-paths
 *            of the first three; /api/adr-calculator + /api/adr/lq-check are
 *            calculators and explicitly excluded)
 *    Limit:  10 requests per 5 minutes per IP, anonymous only
 *    Why:    Post-2026-04-24 incident — see docs/incidents/2026-04-24-api-
 *            airlines-spike.md. The daily API limiter caught the scraper after
 *            25 requests; a tighter short-window check stops bursts before
 *            Cloudflare's L7 rule has to engage.
 *    Skip:   When an API key is present, fall through to (3) — Pro keys at
 *            50k/month don't get clamped to 10/5min.
 *
 * 3. API RATE LIMITING (existing)
 *    Routes: /api/* calculator + reference endpoints
 *    Limit:  25/day anonymous, 100/day free key, 50k/month pro key
 *    Uses:   @vercel/kv with manual counters
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ─────────────────────────────────────────────────────────────────
//  Scrape protection — two tiers, both sliding window
//    HS pages: 10 req / 5 min (slow-crawl scraper)
//    ADR pages: 30 req / 1 min (lighter pressure)
// ─────────────────────────────────────────────────────────────────

let hsRatelimit: Ratelimit | null = null;
let adrRatelimit: Ratelimit | null = null;
let bulkRefRatelimit: Ratelimit | null = null;

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getHsRatelimit(): Ratelimit | null {
  if (hsRatelimit) return hsRatelimit;
  const redis = getRedis();
  if (!redis) return null;
  hsRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '5 m'),
    prefix: 'scrape-rl-hs',
  });
  return hsRatelimit;
}

function getAdrRatelimit(): Ratelimit | null {
  if (adrRatelimit) return adrRatelimit;
  const redis = getRedis();
  if (!redis) return null;
  adrRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'scrape-rl-adr',
  });
  return adrRatelimit;
}

function getBulkRefRatelimit(): Ratelimit | null {
  if (bulkRefRatelimit) return bulkRefRatelimit;
  const redis = getRedis();
  if (!redis) return null;
  bulkRefRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '5 m'),
    prefix: 'scrape-rl-bulkref',
  });
  return bulkRefRatelimit;
}

/** Check if this is an HS data route (not the bare /hs search page) */
function isHsScrapeRoute(pathname: string): boolean {
  return pathname.startsWith('/hs/') && pathname !== '/hs';
}

function isAdrScrapeRoute(pathname: string): boolean {
  return pathname.startsWith('/adr/un/');
}

/** Bulk-reference API endpoints that match the 2026-04-24 incident profile.
 *  Excludes calculators (/api/adr-calculator, /api/adr/lq-check) and small
 *  reference sets (/api/uld, /api/containers, /api/vehicles, /api/incoterms). */
function isBulkRefApiRoute(pathname: string): boolean {
  if (pathname === '/api/adr') return true;
  if (pathname === '/api/airlines' || pathname.startsWith('/api/airlines/')) return true;
  if (pathname === '/api/unlocode' || pathname.startsWith('/api/unlocode/')) return true;
  if (pathname === '/api/hs' || pathname.startsWith('/api/hs/')) return true;
  return false;
}

function isScrapeRoute(pathname: string): boolean {
  return isHsScrapeRoute(pathname) || isAdrScrapeRoute(pathname);
}

/** Extracts an API key from any of the four supported sources. Mirrors
 *  handleApiRateLimit's logic. Returns null if no key is presented. */
function extractApiKey(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  const xApiKey = req.headers.get('x-api-key');
  return (authHeader?.startsWith('Bearer fu_') ? authHeader.slice(7) : null)
    ?? (xApiKey?.startsWith('fu_') ? xApiKey : null)
    ?? req.nextUrl.searchParams.get('apiKey')
    ?? req.nextUrl.searchParams.get('api_key')
    ?? null;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

// ─────────────────────────────────────────────────────────────────
//  Structured 429 — single source of truth for the rate-limit body
//  shape and headers. Every 429 emitted by this middleware goes
//  through buildStructuredRateLimit429 so the JSON shape stays
//  consistent for programmatic callers.
// ─────────────────────────────────────────────────────────────────

type RateLimitTier = 'anon' | 'free' | 'pro';
type RateLimitWindow = '1m' | '5m' | 'day' | 'month';

interface StructuredRateLimit429Opts {
  tier: RateLimitTier;
  limit: number;
  window: RateLimitWindow;
  resetEpochMs: number;
  retryAfterSeconds: number;
  message?: string;
  /** Conversion-oriented affordances appended to the body for anonymous callers. */
  extraBody?: Record<string, unknown>;
}

function buildStructuredRateLimit429(opts: StructuredRateLimit429Opts): {
  body: Record<string, unknown>;
  headers: Record<string, string>;
} {
  const { tier, limit, window, resetEpochMs, retryAfterSeconds, message, extraBody } = opts;
  return {
    body: {
      error: 'rate_limited',
      message: message ?? 'You have exceeded the rate limit for this endpoint.',
      tier,
      limit,
      window,
      reset_at: new Date(resetEpochMs).toISOString(),
      upgrade_url: 'https://www.freightutils.com/pricing',
      ...(extraBody ?? {}),
    },
    headers: {
      'Retry-After': String(retryAfterSeconds),
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil(resetEpochMs / 1000)),
      'Cache-Control': 'no-store',
    },
  };
}

// ─────────────────────────────────────────────────────────────────
//  Conversion-oriented 429 — branded HTML for browsers, structured
//  JSON (with conversion affordances) for APIs and curl/library
//  callers. Residential IPs hitting /hs/* are almost certainly
//  building something; convert them to the free API tier.
// ─────────────────────────────────────────────────────────────────

interface ConversionRateLimitOpts {
  retryAfterSeconds: number;
  limit: number;
  resetEpochMs: number;
  tier: RateLimitTier;
  window: RateLimitWindow;
}

function renderRateLimitHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rate limit hit — FreightUtils</title>
<meta name="robots" content="noindex,nofollow">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;background:#fff;line-height:1.5;-webkit-font-smoothing:antialiased}
.wrap{max-width:720px;margin:0 auto;padding:48px 24px}
header{display:flex;align-items:center;gap:12px;padding-bottom:28px;border-bottom:1px solid #E2E8F0;margin-bottom:48px}
.mark{width:36px;height:36px;background:#EF9F27;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;color:#412402;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:22px;font-weight:800;line-height:1}
.brand{font-size:18px;font-weight:700;letter-spacing:-.01em}
.brand-accent{color:#EF9F27}
.brand-suffix{color:#64748B;font-weight:400}
.eyebrow{display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(37,99,235,.08);color:#2563EB;font-size:12px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;margin-bottom:16px}
h1{font-size:32px;line-height:1.2;letter-spacing:-.02em;font-weight:700;margin-bottom:16px}
.subhead{font-size:17px;color:#475569;max-width:560px;margin-bottom:32px}
.cta{display:inline-block;background:#EF9F27;color:#412402;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:16px;transition:opacity .15s ease}
.cta:hover{opacity:.9}
ul.benefits{list-style:none;margin:32px 0}
ul.benefits li{position:relative;padding-left:28px;margin-bottom:10px;color:#334155;font-size:15px}
ul.benefits li::before{content:'';position:absolute;left:4px;top:8px;width:6px;height:6px;background:#2563EB;border-radius:50%}
.docs-link{color:#EF9F27;text-decoration:none;font-weight:600;font-size:15px;border-bottom:1px solid transparent;transition:border-color .15s ease}
.docs-link:hover{border-bottom-color:#EF9F27}
footer{margin-top:64px;padding-top:24px;border-top:1px solid #E2E8F0;color:#94A3B8;font-size:13px}
footer a{color:#64748B;text-decoration:none;margin-right:4px}
footer a:hover{color:#0F172A}
@media (max-width:480px){h1{font-size:26px}.subhead{font-size:16px}}
</style>
</head>
<body>
<div class="wrap">
<header><span class="mark">/</span><span class="brand">Freight<span class="brand-accent">Utils</span><span class="brand-suffix">.com</span></span></header>
<span class="eyebrow">Customs &amp; Trade Data</span>
<h1>Rate limit hit — looks like you're integrating our data</h1>
<p class="subhead">Anonymous access is capped at 25 requests/day. You've clearly got a use case. Skip the throttle with a free API key — no card, no hassle.</p>
<a class="cta" href="https://www.freightutils.com/api-docs#signup">Get a free API key →</a>
<ul class="benefits">
<li>100 requests/day on the free tier</li>
<li>Clean JSON, full docs, rate-limit headers</li>
<li>Upgrade to Pro (£19/mo) for 50,000/month — one card, no contracts</li>
</ul>
<a class="docs-link" href="https://www.freightutils.com/api-docs">View full API docs →</a>
<footer><a href="https://www.freightutils.com">freightutils.com</a> · <a href="https://www.freightutils.com/pricing">Pricing</a> · <a href="https://www.freightutils.com/api-docs">API docs</a></footer>
</div>
</body>
</html>`;
}

function buildConversionRateLimitResponse(
  req: NextRequest,
  opts: ConversionRateLimitOpts,
): NextResponse {
  const { retryAfterSeconds, limit, resetEpochMs, tier, window } = opts;
  const pathname = req.nextUrl.pathname;
  const accept = (req.headers.get('accept') ?? '').toLowerCase();
  const isApiRoute = pathname.startsWith('/api/');

  // /api/* is always JSON. Otherwise branch by Accept:
  // - text/html in Accept  → branded HTML
  // - anything else (app/json, */*, missing) → structured JSON
  const wantsHtml = !isApiRoute && accept.includes('text/html');

  const { body, headers } = buildStructuredRateLimit429({
    tier,
    limit,
    window,
    resetEpochMs,
    retryAfterSeconds,
    message:
      "Looks like you're integrating FreightUtils data. Grab a free API key for 100 requests/day, no card required.",
    extraBody: {
      signup_url: 'https://www.freightutils.com/api-docs#signup',
      docs_url: 'https://www.freightutils.com/api-docs',
      retry_after_seconds: retryAfterSeconds,
    },
  });

  if (wantsHtml) {
    return new NextResponse(renderRateLimitHtml(), {
      status: 429,
      headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return NextResponse.json(body, { status: 429, headers });
}

/**
 * Bulk-reference API scrape check. Anonymous-only — if a valid API key is
 * presented, returns null so the request falls through to the daily/monthly
 * limiter in handleApiRateLimit. Returns a 429 NextResponse when the 10/5-min
 * sliding window is exceeded for an anonymous IP.
 */
async function tryBulkRefScrape(req: NextRequest): Promise<NextResponse | null> {
  if (extractApiKey(req)) return null;

  const rl = getBulkRefRatelimit();
  if (!rl) return null;

  const ip = getClientIp(req);
  try {
    const { success, remaining, reset } = await rl.limit(ip);
    if (!success) {
      console.warn(
        `[ScrapeGuard] 429 — IP: ${ip}, path: ${req.nextUrl.pathname}, group: bulkref, limit: 10, resets: ${new Date(reset).toISOString()}`,
      );
      return buildConversionRateLimitResponse(req, {
        retryAfterSeconds: 300,
        limit: 10,
        resetEpochMs: reset,
        tier: 'anon',
        window: '5m',
      });
    }
    // Pass through — handleApiRateLimit will run next and emit its own headers.
    // Surface the bulk-ref budget alongside the daily one via response headers.
    void remaining;
    return null;
  } catch (err) {
    console.error('[ScrapeGuard bulkref] Redis error:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function handleScrapeProtection(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const isHs = isHsScrapeRoute(pathname);
  const rl = isHs ? getHsRatelimit() : getAdrRatelimit();

  if (!rl) return NextResponse.next();

  const ip = getClientIp(req);
  const group = isHs ? 'hs' : 'adr';
  const limit = isHs ? 10 : 30;
  const retryAfter = isHs ? 300 : 60; // 5 min vs 1 min
  const window: RateLimitWindow = isHs ? '5m' : '1m';

  try {
    const { success, remaining, reset } = await rl.limit(ip);

    if (!success) {
      console.warn(
        `[ScrapeGuard] 429 — IP: ${ip}, path: ${pathname}, group: ${group}, limit: ${limit}, resets: ${new Date(reset).toISOString()}`
      );
      return buildConversionRateLimitResponse(req, {
        retryAfterSeconds: retryAfter,
        limit,
        resetEpochMs: reset,
        tier: 'anon',
        window,
      });
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(limit));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(reset / 1000)));
    return response;
  } catch (err) {
    console.error('[ScrapeGuard] Redis error:', err instanceof Error ? err.message : err);
    return NextResponse.next();
  }
}

// ─────────────────────────────────────────────────────────────────
//  API rate limiting (existing logic — unchanged)
// ─────────────────────────────────────────────────────────────────

interface KeyRecord {
  email: string;
  plan: 'free' | 'pro';
}

const LIMITS = {
  anonymous: { perDay: 25 },
  free: { perDay: 100 },
  pro: { perMonth: 50000 },
} as const;

function todayKey() { return new Date().toISOString().slice(0, 10); }
function monthKey() { return new Date().toISOString().slice(0, 7); }

async function handleApiRateLimit(req: NextRequest): Promise<NextResponse> {
  // Skip OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') return NextResponse.next();

  // If KV is not configured, log a warning and pass through
  if (!process.env.KV_REST_API_URL) {
    console.warn('[RateLimit] KV_REST_API_URL not set — rate limiting disabled');
    return NextResponse.next();
  }

  // Extract API key from headers or query params
  const authHeader = req.headers.get('authorization');
  const xApiKey = req.headers.get('x-api-key');
  const apiKey =
    (authHeader?.startsWith('Bearer fu_') ? authHeader.slice(7) : null)
    ?? (xApiKey?.startsWith('fu_') ? xApiKey : null)
    ?? req.nextUrl.searchParams.get('apiKey')
    ?? req.nextUrl.searchParams.get('api_key')
    ?? null;

  let tier: RateLimitTier;
  let limit: number;
  let usageKey: string;
  let currentUsage: number;
  let window: 'day' | 'month';

  if (apiKey) {
    // Authenticated request — look up key
    const record = await kv.get<KeyRecord>(`key:${apiKey}`);
    if (!record) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (record.plan === 'pro') {
      tier = 'pro';
      limit = LIMITS.pro.perMonth;
      usageKey = `usage:${apiKey}:${monthKey()}`;
      window = 'month';
    } else {
      tier = 'free';
      limit = LIMITS.free.perDay;
      usageKey = `usage:${apiKey}:${todayKey()}`;
      window = 'day';
    }
  } else {
    // Anonymous — rate limit by IP
    const ip = getClientIp(req);
    tier = 'anon';
    limit = LIMITS.anonymous.perDay;
    usageKey = `usage:ip:${ip}:${todayKey()}`;
    window = 'day';
  }

  // Increment and check
  try {
    currentUsage = await kv.incr(usageKey);
    if (currentUsage === 1) {
      await kv.expire(usageKey, window === 'day' ? 172800 : 2764800); // 48h or 32d
    }
  } catch (err) {
    console.error('[RateLimit] KV error:', err instanceof Error ? err.message : err);
    // KV failed — allow request but log the failure
    return NextResponse.next();
  }

  console.log(`[RateLimit] ${usageKey} = ${currentUsage}/${limit}`);

  // Reset is computed for both 2xx (advisory header) and 429 (binding) paths.
  const resetSeconds = window === 'day'
    ? Math.ceil((new Date(todayKey() + 'T00:00:00Z').getTime() + 86400000 - Date.now()) / 1000)
    : Math.ceil((new Date(monthKey() + '-01T00:00:00Z').getTime() + 2764800000 - Date.now()) / 1000);
  const resetEpochMs = Date.now() + resetSeconds * 1000;

  // Track request source (MCP vs browser vs direct API) — fire-and-forget
  const ua = (req.headers.get('user-agent') ?? '').toLowerCase();
  const source = ua.includes('freightutils-mcp') || ua.includes('mcp') ? 'mcp'
    : ua.includes('node') || ua.includes('axios') || ua.includes('python') ? 'api'
    : ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') ? 'browser'
    : 'other';
  kv.incr(`source:${source}:${todayKey()}`).catch(() => {});

  if (currentUsage > limit) {
    // Anonymous → conversion-oriented 429 (HTML or JSON by Accept; JSON body
    // carries the structured fields plus the conversion affordances).
    // Authenticated → structured 429 only (key-holders already converted).
    if (!apiKey) {
      return buildConversionRateLimitResponse(req, {
        retryAfterSeconds: resetSeconds,
        limit,
        resetEpochMs,
        tier,
        window,
      });
    }

    const { body, headers } = buildStructuredRateLimit429({
      tier,
      limit,
      window,
      resetEpochMs,
      retryAfterSeconds: resetSeconds,
    });
    return NextResponse.json(body, { status: 429, headers });
  }

  // Proceed with rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, limit - currentUsage)));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetEpochMs / 1000)));
  response.headers.set('X-RateLimit-Window', window === 'day' ? '86400' : '2592000');
  return response;
}

// ─────────────────────────────────────────────────────────────────
//  Router — dispatch to the right handler
// ─────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // (1) PAGE route scrape protection — /hs/* + /adr/un/*
  if (isScrapeRoute(pathname)) {
    return handleScrapeProtection(req);
  }

  // (2) Bulk-reference API scrape protection — anonymous-only, falls through
  //     to (3) when an API key is presented or the request is under budget.
  if (isBulkRefApiRoute(pathname)) {
    const blocked = await tryBulkRefScrape(req);
    if (blocked) return blocked;
  }

  // (3) Existing daily/key-based API rate limiter
  return handleApiRateLimit(req);
}

// ─────────────────────────────────────────────────────────────────
//  Matcher — only run on these routes
// ─────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    // Scrape protection — data-heavy page routes
    // HS: broad catch — covers /hs/heading/*, /hs/code/*, /hs/section/*, /hs/chapter/*
    // The bare /hs page is matched but passed through (isHsScrapeRoute excludes it)
    '/hs/:path+',
    '/adr/un/:path*',

    // API rate limiting — calculation endpoints (existing)
    '/api/cbm/:path*',
    '/api/chargeable-weight/:path*',
    '/api/consignment/:path*',
    '/api/convert/:path*',
    '/api/duty/:path*',
    '/api/adr',
    '/api/adr-calculator/:path*',
    '/api/adr/lq-check/:path*',
    '/api/airlines/:path*',
    '/api/containers/:path*',
    '/api/hs/:path*',
    '/api/incoterms/:path*',
    '/api/ldm/:path*',
    '/api/pallet/:path*',
    '/api/unlocode/:path*',
    '/api/uld/:path*',
    '/api/vehicles/:path*',
    '/api/shipment/:path*',
  ],
};
