import { NextRequest, NextResponse } from 'next/server';
import { createMagicToken } from '@/lib/auth/kv';
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleaned = (email ?? '').trim().toLowerCase();

    if (!cleaned || !EMAIL_RE.test(cleaned)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const token = await createMagicToken(cleaned);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.freightutils.com';
    const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;

    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: 'FreightUtils <noreply@freightutils.com>',
        to: cleaned,
        subject: 'Sign in to FreightUtils',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2332;">
            <div style="background: #1a2332; padding: 24px 32px; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; font-size: 20px; margin: 0;">FreightUtils</h1>
            </div>
            <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Click the button below to sign in to your FreightUtils dashboard:
              </p>
              <a href="${verifyUrl}"
                 style="display: inline-block; background: #e87722; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Sign In
              </a>
              <p style="font-size: 13px; color: #9ca3af; margin: 24px 0 0;">
                This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });
    } else {
      // Dev fallback — log the magic link
      console.log('MAGIC_LINK:', verifyUrl);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Failed to send login email' }, { status: 500 });
  }
}
