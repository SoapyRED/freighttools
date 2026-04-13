import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Resend } from 'resend';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUDIENCE_ID = '6b76b9b2-224b-4fe6-afe9-52097c7245db';

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const h = { ...CORS, 'Content-Type': 'application/json' };

  try {
    // Rate limit: 5 per IP per hour
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip') ?? 'unknown';

    if (process.env.KV_REST_API_URL) {
      const rateKey = `newsletter:ip:${ip}:${new Date().toISOString().slice(0, 13)}`;
      try {
        const count = await kv.incr(rateKey);
        if (count === 1) await kv.expire(rateKey, 7200);
        if (count > 5) {
          return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: h });
        }
      } catch { /* KV unavailable — allow through */ }
    }

    const body = await req.json();
    const email = (body?.email ?? '').trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400, headers: h });
    }

    const resend = getResend();
    if (resend) {
      try {
        await resend.contacts.create({
          email,
          audienceId: AUDIENCE_ID,
          unsubscribed: false,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('already exists')) {
          return NextResponse.json({ error: 'Already subscribed.', success: true }, { headers: h });
        }
        console.error('[Newsletter] Resend error:', msg);
      }
    }

    console.log('[Newsletter] New subscriber:', email);
    return NextResponse.json({ success: true }, { headers: h });

  } catch (err) {
    console.error('[Newsletter] Error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500, headers: h });
  }
}
