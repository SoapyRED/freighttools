export interface UptimeRobotLog {
  type: number;
  at: number;
  durationSec: number;
  reason: string;
}

export interface UptimeRobotData {
  available: boolean;
  state: 'ok' | 'degraded' | 'down' | 'unknown';
  uptime24h: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  downSec24h: number | null;
  downSec7d: number | null;
  downSec30d: number | null;
  avgResponseMs: number | null;
  lastIncident: UptimeRobotLog | null;
  monitorUrl: string | null;
  monitorId: number | null;
  intervalSec: number | null;
}

const EMPTY: UptimeRobotData = {
  available: false,
  state: 'unknown',
  uptime24h: null, uptime7d: null, uptime30d: null,
  downSec24h: null, downSec7d: null, downSec30d: null,
  avgResponseMs: null,
  lastIncident: null,
  monitorUrl: null,
  monitorId: null,
  intervalSec: null,
};

function mapStatus(status: number): UptimeRobotData['state'] {
  if (status === 2) return 'ok';
  if (status === 9) return 'down';
  if (status === 8) return 'degraded';
  return 'unknown';
}

function splitRatio(s: string | undefined, n: number): (number | null)[] {
  if (!s) return Array(n).fill(null);
  const parts = s.split('-');
  return parts.slice(0, n).map(p => {
    const v = parseFloat(p);
    return isFinite(v) ? v : null;
  });
}

export async function getUptimeRobotStats(): Promise<UptimeRobotData> {
  const apiKey = process.env.UPTIMEROBOT_API_KEY;
  if (!apiKey) return EMPTY;

  try {
    const res = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        api_key: apiKey,
        format: 'json',
        custom_uptime_ratios: '1-7-30',
        custom_down_durations: '1-7-30',
        logs: '1',
        logs_limit: '10',
        response_times: '0',
      }),
      next: { revalidate: 60 },
    });
    if (!res.ok) return EMPTY;
    const data = await res.json() as {
      stat?: string;
      monitors?: Array<{
        id: number;
        url?: string;
        status?: number;
        interval?: number;
        custom_uptime_ratio?: string;
        custom_down_durations?: string;
        average_response_time?: string;
        logs?: Array<{ type: number; datetime: number; duration: number; reason?: { code?: string; detail?: string } }>;
      }>;
    };
    if (data.stat !== 'ok' || !data.monitors?.length) return EMPTY;

    const m = data.monitors[0];
    const [u24, u7, u30] = splitRatio(m.custom_uptime_ratio, 3);
    const [d24, d7, d30] = splitRatio(m.custom_down_durations, 3);
    const downLog = (m.logs || []).find(l => l.type === 1);
    const lastIncident: UptimeRobotLog | null = downLog ? {
      type: downLog.type,
      at: downLog.datetime * 1000,
      durationSec: downLog.duration,
      reason: downLog.reason?.detail || downLog.reason?.code || '',
    } : null;

    return {
      available: true,
      state: mapStatus(m.status ?? 0),
      uptime24h: u24,
      uptime7d: u7,
      uptime30d: u30,
      downSec24h: d24,
      downSec7d: d7,
      downSec30d: d30,
      avgResponseMs: m.average_response_time ? parseFloat(m.average_response_time) : null,
      lastIncident,
      monitorUrl: m.url || null,
      monitorId: m.id,
      intervalSec: m.interval ?? null,
    };
  } catch (err) {
    console.error('[uptimerobot]', err);
    return EMPTY;
  }
}
