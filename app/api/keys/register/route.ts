import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Resend } from 'resend';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

function generateApiKey(): string {
  const chars = '0123456789abcdef';
  let key = 'fu_';
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const h = { ...CORS, 'Content-Type': 'application/json' };

  try {
    // Rate limit signups: 5 per IP per hour
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip') ?? 'unknown';
    const signupKey = `signup:ip:${ip}:${new Date().toISOString().slice(0, 13)}`;
    const signupCount = await kv.incr(signupKey);
    if (signupCount === 1) await kv.expire(signupKey, 7200);
    if (signupCount > 5) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Try again in an hour.' },
        { status: 429, headers: h },
      );
    }

    const body = await req.json();
    const email = (body?.email ?? '').trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400, headers: h });
    }

    // Check if this email already has a key
    const existingKey = await kv.get<string>(`email:${email}`);
    if (existingKey) {
      // Re-send the existing key
      const resend = getResend();
      if (resend) {
        await sendKeyEmail(resend, email, existingKey).catch(() => {});
      }
      return NextResponse.json(
        { success: true, message: 'API key re-sent to your email.' },
        { headers: h },
      );
    }

    // Generate new key
    const apiKey = generateApiKey();
    const record = { email, plan: 'free' as const, created: new Date().toISOString() };

    // Store in KV: key → record, email → key (for lookup/re-send)
    await kv.set(`key:${apiKey}`, record);
    await kv.set(`email:${email}`, apiKey);

    // Send email with the key
    const resend = getResend();
    if (resend) {
      await sendKeyEmail(resend, email, apiKey).catch((err) => {
        console.error('[API Key] Email send failed:', err);
      });

      // Add to audience
      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (audienceId) {
        await resend.contacts.create({ email, audienceId, unsubscribed: false }).catch(() => {});
      }
    }

    console.log(`[API Key] New key issued for ${email}`);

    return NextResponse.json(
      { success: true, message: 'API key sent to your email. Check your inbox.' },
      { headers: h },
    );
  } catch (err) {
    console.error('[API Key] Registration error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: h },
    );
  }
}

async function sendKeyEmail(resend: Resend, email: string, apiKey: string) {
  await resend.emails.send({
    from: 'FreightUtils <noreply@freightutils.com>',
    to: email,
    subject: 'Your FreightUtils API Key',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2332;">
        <div style="background: #1a2332; padding: 24px 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; font-size: 20px; margin: 0;">FreightUtils</h1>
        </div>
        <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Here's your free API key:
          </p>
          <div style="background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; font-family: 'Courier New', monospace; font-size: 15px; font-weight: 600; color: #1a2332; word-break: break-all; margin-bottom: 20px;">
            ${apiKey}
          </div>
          <p style="font-size: 14px; color: #5a6478; line-height: 1.6; margin: 0 0 8px;">
            <strong>Rate limit:</strong> 100 requests/day
          </p>
          <p style="font-size: 14px; color: #5a6478; line-height: 1.6; margin: 0 0 20px;">
            <strong>Usage:</strong> Add as a header (<code>X-API-Key: ${apiKey}</code>) or query parameter (<code>?apiKey=${apiKey}</code>).
          </p>
          <a href="https://www.freightutils.com/api-docs"
             style="display: inline-block; background: #e87722; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View API Documentation
          </a>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 13px; color: #9ca3af; margin: 0;">
            Need higher limits? Pro tier (50,000/month) &mdash;
            <a href="mailto:contact@freightutils.com" style="color: #e87722;">contact@freightutils.com</a>
          </p>
        </div>
      </div>
    `,
  });
}
