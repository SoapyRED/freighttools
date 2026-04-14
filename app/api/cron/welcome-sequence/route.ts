import { NextRequest, NextResponse } from 'next/server';
import { processWelcomeSequences } from '@/lib/email/welcome';

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processWelcomeSequences();
    console.log('[Welcome Cron]', result);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Welcome Cron] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
