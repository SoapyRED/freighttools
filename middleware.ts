/**
 * Edge Middleware — two concerns:
 *
 * 1. SCRAPE PROTECTION (new)
 *    Routes: /hs/heading/*, /hs/code/*, /adr/un/*
 *    Limit:  30 requests per minute per IP (sliding window via @upstash/ratelimit)
 *    Why:    Sequential scrapers are crawling HS heading/code and ADR UN pages,
 *            burning Vercel credits. This returns 429 to repeat offenders.
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
//  Scrape protection — sliding window, 30 req/min per IP
// ─────────────────────────────────────────────────────────────────

let scrapeRatelimit: Ratelimit | null = null;

function getScrapeRatelimit(): Ratelimit | null {
  if (scrapeRatelimit) return scrapeRatelimit;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  scrapeRatelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'scrape-rl',
  });
  return scrapeRatelimit;
}

/** Route prefixes that trigger scrape protection */
const SCRAPE_PREFIXES = ['/hs/heading/', '/hs/code/', '/adr/un/'];

function isScrapeRoute(pathname: string): boolean {
  return SCRAPE_PREFIXES.some(p => pathname.startsWith(p));
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

async function handleScrapeProtection(req: NextRequest): Promise<NextResponse> {
  const rl = getScrapeRatelimit();
  if (!rl) {
    // KV not configured — pass through
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  const { pathname } = req.nextUrl;

  // Key includes route group to prevent collisions: "hs:<ip>" vs "adr:<ip>"
  const group = pathname.startsWith('/adr/') ? 'adr' : 'hs';
  const key = `${group}:${ip}`;

  try {
    const { success, remaining, reset } = await rl.limit(key);

    if (!success) {
      console.warn(
        `[ScrapeGuard] 429 — IP: ${ip}, path: ${pathname}, group: ${group}, resets: ${new Date(reset).toISOString()}`
      );
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please slow down.',
          retryAfter: 60,
        },
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
          },
        },
      );
    }

    // Allowed — pass through with rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '30');
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

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        limit: apiKey ? `${limit} requests/${window}` : '25 requests/day (anonymous)',
        ...(apiKey
          ? { message: `Your ${window}ly limit of ${limit} requests has been reached. Contact contact@freightutils.com for Pro access.` }
          : {
              upgrade: 'Get a free API key for 100 requests/day at https://www.freightutils.com/api-docs#signup',
              upgrade_url: 'https://www.freightutils.com/pricing',
              pro: 'Need more? Pro tier: 50,000 requests/month. See https://www.freightutils.com/pricing',
            }),
      },
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(resetSeconds),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + resetSeconds),
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
    '/hs/heading/:path*',
    '/hs/code/:path*',
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
