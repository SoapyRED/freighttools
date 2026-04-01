import { NextRequest, NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const h = CORS_HEADERS;
  try {
    const body = await req.json();
    const email = (body?.email ?? '').trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400, headers: h });
    }

    // Log to Vercel runtime logs — retrieve from Vercel dashboard > Logs
    console.log('NEW_SUBSCRIBER:', email, new Date().toISOString());

    return NextResponse.json({ success: true }, { headers: h });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers: h });
  }
}
