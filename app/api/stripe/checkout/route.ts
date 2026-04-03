import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth/session';
import { getSession, getUser } from '@/lib/auth/kv';
import { getStripe } from '@/lib/auth/stripe';

export async function POST() {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = await getSession(sessionToken);
  if (!email) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  const user = await getUser(email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.plan === 'pro') {
    return NextResponse.json({ error: 'Already on Pro plan' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.freightutils.com';

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.stripeCustomerId ? undefined : email,
    customer: user.stripeCustomerId ?? undefined,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=true`,
    cancel_url: `${baseUrl}/dashboard`,
    metadata: { email },
  });

  return NextResponse.json({ url: session.url });
}
