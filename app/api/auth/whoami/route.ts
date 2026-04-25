/**
 * API key verification — used by n8n / Zapier / programmatic clients to
 * green-tick a credential test. Returns 200 only when a valid API key is
 * presented; never echoes the full key back to the caller.
 *
 * Why a separate path from /api/auth/verify? That path is the website's
 * magic-link login callback. This endpoint is API-key auth, not
 * session-cookie auth — different concern, different consumer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface KeyRecord {
  email: string;
  plan: 'free' | 'pro';
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Cache-Control': 'no-store',
};

const UPGRADE_URL = 'https://www.freightutils.com/pricing';
const SIGNUP_URL = 'https://www.freightutils.com/api-docs#signup';

function extractApiKey(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  const xApiKey = req.headers.get('x-api-key');
  return (authHeader?.startsWith('Bearer fu_') ? authHeader.slice(7) : null)
    ?? (xApiKey?.startsWith('fu_') ? xApiKey : null)
    ?? req.nextUrl.searchParams.get('apiKey')
    ?? req.nextUrl.searchParams.get('api_key')
    ?? null;
}

function unauthenticated(message: string) {
  return NextResponse.json(
    {
      error: 'unauthenticated',
      message,
      upgrade_url: UPGRADE_URL,
      signup_url: SIGNUP_URL,
    },
    { status: 401, headers: CORS },
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const apiKey = extractApiKey(req);

  if (!apiKey) {
    return unauthenticated('No API key provided. Send your key in the X-API-Key header or Authorization: Bearer prefix.');
  }

  if (!process.env.KV_REST_API_URL) {
    // Local dev without KV creds — can't verify. Fail closed so callers don't
    // mistake an unconfigured local for a green credential test.
    return unauthenticated('Auth verification unavailable in this environment (KV not configured).');
  }

  let record: KeyRecord | null = null;
  try {
    record = await kv.get<KeyRecord>(`key:${apiKey}`);
  } catch (err) {
    console.error('[auth/whoami] KV error:', err instanceof Error ? err.message : err);
    return unauthenticated('Auth verification temporarily unavailable. Try again in a moment.');
  }

  if (!record) {
    return unauthenticated('Invalid API key.');
  }

  return NextResponse.json(
    {
      authenticated: true,
      tier: record.plan,
      key_prefix: apiKey.slice(0, 7),
    },
    { status: 200, headers: CORS },
  );
}
