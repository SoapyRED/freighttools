import { kv } from '@vercel/kv';

export interface StatusSample {
  t: number;
  ok: boolean;
  status: number;
  ms: number;
}

export const SAMPLE_TTL_SECONDS = 60 * 60 * 24 * 30;

export function dayKey(d: Date): string {
  return `status:history:${d.toISOString().slice(0, 10)}`;
}

export async function appendSample(sample: StatusSample): Promise<void> {
  const key = dayKey(new Date(sample.t));
  const existing = (await kv.get<StatusSample[]>(key)) || [];
  existing.push(sample);
  await kv.set(key, existing, { ex: SAMPLE_TTL_SECONDS });
}

export async function getRecentSamples(days: number): Promise<StatusSample[]> {
  const out: StatusSample[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    try {
      const arr = await kv.get<StatusSample[]>(dayKey(d));
      if (arr) out.push(...arr);
    } catch {
      // swallow — partial history is acceptable
    }
  }
  return out.sort((a, b) => a.t - b.t);
}

export interface StatusStats {
  current: 'ok' | 'degraded' | 'down' | 'unknown';
  uptime24h: number | null;
  uptime7d: number | null;
  lastIncident: StatusSample | null;
  latestSample: StatusSample | null;
  sampleCount: number;
}

export function computeStats(samples: StatusSample[]): StatusStats {
  const now = Date.now();
  const in24h = samples.filter(s => s.t >= now - 24 * 3600 * 1000);
  const in7d  = samples.filter(s => s.t >= now - 7 * 24 * 3600 * 1000);

  const uptime24h = in24h.length > 0 ? (in24h.filter(s => s.ok).length / in24h.length) * 100 : null;
  const uptime7d  = in7d.length  > 0 ? (in7d.filter(s => s.ok).length  / in7d.length)  * 100 : null;

  const latest = samples.at(-1) ?? null;
  const lastIncident = [...samples].reverse().find(s => !s.ok) ?? null;

  let current: StatusStats['current'] = 'unknown';
  if (latest) {
    if (!latest.ok) current = 'down';
    else if (uptime24h !== null && uptime24h < 99) current = 'degraded';
    else current = 'ok';
  }

  return {
    current,
    uptime24h,
    uptime7d,
    lastIncident,
    latestSample: latest,
    sampleCount: samples.length,
  };
}
