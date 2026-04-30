import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createMagicToken, createUser, getUser, type User } from '@/lib/auth/kv';
import { getResend, sendApiKeyEmail } from '@/lib/email/api-key';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ensureUserAccount(email: string): Promise<{ user: User; isNew: boolean }> {
  const existing = await getUser(email);
  if (existing) return { user: existing, isNew: false };

  // Legacy /api/keys/register users have email:${email} but no user:${email}.
  // Migrate by reusing their existing apiKey to avoid issuing a duplicate key.
  const legacyApiKey = await kv.get<string>(`email:${email}`);
  if (legacyApiKey) {
    const user: User = {
      email,
      plan: 'free',
      apiKey: legacyApiKey,
      stripeCustomerId: null,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`user:${email}`, user);
    return { user, isNew: false };
  }

  const user = await createUser(email);
  await kv.set(`email:${email}`, user.apiKey);
  return { user, isNew: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cleaned = (body?.email ?? '').trim().toLowerCase();
    const intent = body?.intent === 'upgrade' ? 'upgrade' as const : undefined;

    if (!cleaned || !EMAIL_RE.test(cleaned)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const resend = getResend();

    if (intent === 'upgrade') {
      const { user, isNew } = await ensureUserAccount(cleaned);
      if (isNew && resend) {
        await sendApiKeyEmail(resend, cleaned, user.apiKey).catch((err) => {
          console.error('[Login upgrade] API key email failed:', err);
        });
      }
    }

    const token = await createMagicToken(cleaned, intent);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.freightutils.com';
    const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;

    const subject = intent === 'upgrade'
      ? 'Verify your email to continue to payment'
      : 'Sign in to FreightUtils';
    const ctaLabel = intent === 'upgrade' ? 'Continue to Payment' : 'Sign In';
    const intro = intent === 'upgrade'
      ? "You're one step away from upgrading to FreightUtils Pro. Click the button below to verify your email and continue to secure Stripe checkout:"
      : 'Click the button below to sign in to your FreightUtils dashboard:';
    const postPaymentNote = intent === 'upgrade'
      ? `<p style="font-size: 14px; color: #5a6478; line-height: 1.6; margin: 20px 0 0;">After payment, your Pro tier (50,000 requests/month) activates immediately on the API key already in your inbox.</p>`
      : '';

    if (resend) {
      await resend.emails.send({
        from: 'FreightUtils <noreply@freightutils.com>',
        to: cleaned,
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2332;">
            <div style="background: #1a2332; padding: 24px 32px; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; font-size: 20px; margin: 0;">FreightUtils</h1>
            </div>
            <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                ${intro}
              </p>
              <a href="${verifyUrl}"
                 style="display: inline-block; background: #e87722; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                ${ctaLabel}
              </a>
              ${postPaymentNote}
              <p style="font-size: 13px; color: #9ca3af; margin: 24px 0 0;">
                This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });
    } else {
      console.log('MAGIC_LINK:', verifyUrl);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Failed to send login email' }, { status: 500 });
  }
}
