/**
 * Edge Middleware — two concerns:
 *
 * 1. SCRAPE PROTECTION
 *    HS routes (/hs/heading/*, /hs/code/*, /hs/section/*, /hs/chapter/*):
 *      10 requests per 5 minutes per IP — tight, scraper is slow-crawling
 *    ADR routes (/adr/un/*):
 *      30 requests per minute per IP — lighter pressure
 *    Why: Sequential scrapers are crawling data pages, burning Vercel credits.
 *
 * 2. API RATE LIMITING (existing)
 *    Routes: /api/* calculation endpoints
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

/** Check if this is an HS data route (not the bare /hs search page) */
function isHsScrapeRoute(pathname: string): boolean {
  return pathname.startsWith('/hs/') && pathname !== '/hs';
}

function isAdrScrapeRoute(pathname: string): boolean {
  return pathname.startsWith('/adr/un/');
}

function isScrapeRoute(pathname: string): boolean {
  return isHsScrapeRoute(pathname) || isAdrScrapeRoute(pathname);
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

// ─────────────────────────────────────────────────────────────────
//  Conversion-oriented 429 — branded HTML for browsers, JSON for APIs
//
//  Turn rate-limited users into sign-ups instead of punishing them.
//  Residential IPs hitting /hs/* are almost certainly building something;
//  convert them to the free API tier.
// ─────────────────────────────────────────────────────────────────

interface ConversionRateLimitOpts {
  retryAfterSeconds: number;
  limit: number;
  resetEpochMs: number;
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
  const { retryAfterSeconds, limit, resetEpochMs } = opts;
  const pathname = req.nextUrl.pathname;
  const accept = (req.headers.get('accept') ?? '').toLowerCase();
  const isApiRoute = pathname.startsWith('/api/');

  // /api/* is always JSON. Otherwise branch by Accept:
  // - text/html in Accept  → branded HTML
  // - anything else (app/json, */*, missing) → structured JSON
  const wantsHtml = !isApiRoute && accept.includes('text/html');

  const baseHeaders: Record<string, string> = {
    'Retry-After': String(retryAfterSeconds),
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': '0',
    'X-RateLimit-Reset': String(Math.ceil(resetEpochMs / 1000)),
    'Cache-Control': 'no-store',
  };

  if (wantsHtml) {
    return new NextResponse(renderRateLimitHtml(), {
      status: 429,
      headers: { ...baseHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return NextResponse.json(
    {
      error: 'rate_limit_exceeded',
      message: "Looks like you're integrating FreightUtils data. Grab a free API key for 100 requests/day, no card required.",
      free_tier: '100 requests/day',
      pro_tier: '50,000 requests/month at £19/mo',
      signup_url: 'https://www.freightutils.com/api-docs#signup',
      pricing_url: 'https://www.freightutils.com/pricing',
      docs_url: 'https://www.freightutils.com/api-docs',
      retry_after_seconds: retryAfterSeconds,
    },
    { status: 429, headers: baseHeaders },
  );
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
      });
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(limit));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
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
      limit = LIMITS.pro.perMonth;
      usageKey = `usage:${apiKey}:${monthKey()}`;
      window = 'month';
    } else {
      limit = LIMITS.free.perDay;
      usageKey = `usage:${apiKey}:${todayKey()}`;
      window = 'day';
    }
  } else {
    // Anonymous — rate limit by IP
    const ip = getClientIp(req);
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

  // Track request source (MCP vs browser vs direct API) — fire-and-forget
  const ua = (req.headers.get('user-agent') ?? '').toLowerCase();
  const source = ua.includes('freightutils-mcp') || ua.includes('mcp') ? 'mcp'
    : ua.includes('node') || ua.includes('axios') || ua.includes('python') ? 'api'
    : ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari') ? 'browser'
    : 'other';
  kv.incr(`source:${source}:${todayKey()}`).catch(() => {});

  if (currentUsage > limit) {
    const resetSeconds = window === 'day'
      ? Math.ceil((new Date(todayKey() + 'T00:00:00Z').getTime() + 86400000 - Date.now()) / 1000)
      : Math.ceil((new Date(monthKey() + '-01T00:00:00Z').getTime() + 2764800000 - Date.now()) / 1000);
    const resetEpochMs = Date.now() + resetSeconds * 1000;

    // Anonymous users → conversion-oriented 429 (HTML or JSON by Accept)
    // Authenticated users → existing JSON (they already have a key; conversion doesn't apply)
    if (!apiKey) {
      return buildConversionRateLimitResponse(req, {
        retryAfterSeconds: resetSeconds,
        limit,
        resetEpochMs,
      });
    }

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        limit: `${limit} requests/${window}`,
        message: `Your ${window}ly limit of ${limit} requests has been reached. Contact contact@freightutils.com for Pro access.`,
      },
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(resetSeconds),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetEpochMs / 1000)),
        },
      },
    );
  }

  // Proceed with rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, limit - currentUsage)));
  response.headers.set('X-RateLimit-Window', window === 'day' ? '86400' : '2592000');
  return response;
}

// ─────────────────────────────────────────────────────────────────
//  Router — dispatch to the right handler
// ─────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isScrapeRoute(pathname)) {
    return handleScrapeProtection(req);
  }

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
