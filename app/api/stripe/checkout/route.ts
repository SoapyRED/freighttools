import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth/session';
import { getSession, getUser } from '@/lib/auth/kv';
import { getStripe } from '@/lib/auth/stripe';

async function buildCheckoutUrl(): Promise<{ url?: string; error?: string; status: number }> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return { error: 'Not authenticated', status: 401 };

  const email = await getSession(sessionToken);
  if (!email) return { error: 'Session expired', status: 401 };

  const user = await getUser(email);
  if (!user) return { error: 'User not found', status: 404 };
  if (user.plan === 'pro') return { error: 'Already on Pro plan', status: 400 };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.freightutils.com';
  const refundPolicyUrl = `${baseUrl}/refund-policy`;
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.stripeCustomerId ? undefined : email,
    customer: user.stripeCustomerId ?? undefined,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=true`,
    cancel_url: `${baseUrl}/pricing?cancelled=1`,
    metadata: { email, refund_policy_url: refundPolicyUrl },
    custom_text: {
      submit: {
        message: `Cancel anytime. See our [refund policy](${refundPolicyUrl}). UK 14-day cooling-off right is waived once the API is used post-purchase.`,
      },
    },
  });

  return { url: session.url ?? undefined, status: 200 };
}

export async function POST() {
  const result = await buildCheckoutUrl();
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ url: result.url });
}

export async function GET() {
  const result = await buildCheckoutUrl();
  if (result.error || !result.url) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.freightutils.com';
    const dest = result.status === 401
      ? `${baseUrl}/login?error=session_expired`
      : `${baseUrl}/dashboard?checkout_error=${encodeURIComponent(result.error ?? 'unknown')}`;
    return NextResponse.redirect(dest, 302);
  }
  return NextResponse.redirect(result.url, 302);
}
