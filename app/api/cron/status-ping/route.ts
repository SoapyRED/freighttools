import { NextRequest, NextResponse } from 'next/server';
import { appendSample, type StatusSample } from '@/lib/status';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEALTH_URL = 'https://www.freightutils.com/api/health';
const TIMEOUT_MS = 8000;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';

  if (!isVercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const start = Date.now();
  let status = 0;
  let ok = false;
  try {
    const res = await fetch(HEALTH_URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': 'freightutils-status-ping' },
    });
    status = res.status;
    ok = res.ok;
  } catch (err) {
    console.warn('[status-ping] health fetch failed', err instanceof Error ? err.message : err);
  }

  const sample: StatusSample = { t: Date.now(), ok, status, ms: Date.now() - start };

  try {
    await appendSample(sample);
  } catch (err) {
    console.error('[status-ping] KV write failed', err);
    return NextResponse.json({ ...sample, kv: 'error' }, { status: 500 });
  }

  return NextResponse.json(sample);
}
