import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Match only the 12 calculation API routes (not /api/auth, /api/stripe, /api/mcp, /api/subscribe)
export const config = {
  matcher: [
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

export async function middleware(req: NextRequest) {
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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown';
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
              pro: 'Need more? Pro tier: 50,000 requests/month. Contact contact@freightutils.com',
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
