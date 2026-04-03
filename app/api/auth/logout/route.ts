import { NextResponse } from 'next/server';
import { getSessionToken, clearSessionCookie } from '@/lib/auth/session';
import { deleteSession } from '@/lib/auth/kv';

export async function POST() {
  const sessionToken = await getSessionToken();
  if (sessionToken) {
    await deleteSession(sessionToken);
  }
  await clearSessionCookie();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.freightutils.com'));
}
