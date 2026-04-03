import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicToken, createUser, createSession } from '@/lib/auth/kv';
import { setSessionCookie } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', req.url));
  }

  const email = await verifyMagicToken(token);
  if (!email) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  // Create user if first login, or get existing
  await createUser(email);

  // Create session
  const sessionToken = await createSession(email);
  await setSessionCookie(sessionToken);

  return NextResponse.redirect(new URL('/dashboard', req.url));
}
