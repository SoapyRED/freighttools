import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Match only the 11 calculation API routes (not /api/auth, /api/stripe, /api/mcp, /api/subscribe)
export const config = {
  matcher: [
    '/api/cbm/:path*',
    '/api/chargeable-weight/:path*',
    '/api/convert/:path*',
    '/api/adr',
    '/api/adr-calculator/:path*',
    '/api/airlines/:path*',
    '/api/containers/:path*',
    '/api/hs/:path*',
    '/api/incoterms/:path*',
    '/api/ldm/:path*',
    '/api/pallet/:path*',
  ],
};

interface KeyRecord {
  email: string;
  plan: 'free' | 'pro';
}

const LIMITS = {
  anonymous: { perDay: 100 },
  free: { perDay: 200 },
  pro: { perMonth: 10000 },
} as const;

function todayKey() { return new Date().toISOString().slice(0, 10); }
function monthKey() { return new Date().toISOString().slice(0, 7); }

export async function middleware(req: NextRequest) {
  // Skip OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') return NextResponse.next();

  // Extract API key from Authorization header or query param
  const authHeader = req.headers.get('authorization');
  const apiKey = authHeader?.startsWith('Bearer fu_live_')
    ? authHeader.slice(7)
    : req.nextUrl.searchParams.get('api_key') ?? null;

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
  currentUsage = await kv.incr(usageKey);
  if (currentUsage === 1) {
    await kv.expire(usageKey, window === 'day' ? 172800 : 2764800); // 48h or 32d
  }

  if (currentUsage > limit) {
    const resetSeconds = window === 'day'
      ? Math.ceil((new Date(todayKey() + 'T00:00:00Z').getTime() + 86400000 - Date.now()) / 1000)
      : Math.ceil((new Date(monthKey() + '-01T00:00:00Z').getTime() + 2764800000 - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: apiKey
          ? `Your ${window}ly limit of ${limit} requests has been reached. Upgrade at https://www.freightutils.com/dashboard`
          : `Free tier allows 100 requests per day. Get an API key at https://www.freightutils.com/login for 200/day, or upgrade to Pro for 10,000/month.`,
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
