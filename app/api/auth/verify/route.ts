import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicToken, createUser, createSession } from '@/lib/auth/kv';
import { setSessionCookie } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', req.url));
  }

  const payload = await verifyMagicToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  // Create user if first login, or get existing
  await createUser(payload.email);

  // Create session
  const sessionToken = await createSession(payload.email);
  await setSessionCookie(sessionToken);

  const dest = payload.intent === 'upgrade' ? '/api/stripe/checkout' : '/dashboard';
  return NextResponse.redirect(new URL(dest, req.url));
}
