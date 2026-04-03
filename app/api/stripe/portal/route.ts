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
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.freightutils.com';
  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
