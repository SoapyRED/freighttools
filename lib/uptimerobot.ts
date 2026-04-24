export type UptimeRobotState = 'ok' | 'degraded' | 'down' | 'unknown';

export interface UptimeRobotIncident {
  at: number;
  durationSec: number;
  reason: string;
}

export interface UptimeRobotMonitor {
  id: number;
  name: string;
  url: string;
  state: UptimeRobotState;
  intervalSec: number | null;
  uptime24h: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  avgResponseMs: number | null;
  lastIncident: UptimeRobotIncident | null;
}

export interface UptimeRobotAggregate {
  state: UptimeRobotState;
  uptime24h: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  avgResponseMs: number | null;
  lastIncident: UptimeRobotIncident | null;
}

export interface UptimeRobotData {
  available: boolean;
  reason: string | null;
  monitors: UptimeRobotMonitor[];
  aggregate: UptimeRobotAggregate;
}

const EMPTY_AGGREGATE: UptimeRobotAggregate = {
  state: 'unknown',
  uptime24h: null,
  uptime7d: null,
  uptime30d: null,
  avgResponseMs: null,
  lastIncident: null,
};

function empty(reason: string | null): UptimeRobotData {
  return { available: false, reason, monitors: [], aggregate: EMPTY_AGGREGATE };
}

function mapStatus(status: number): UptimeRobotState {
  if (status === 2) return 'ok';
  if (status === 9) return 'down';
  if (status === 8) return 'degraded';
  return 'unknown';
}

function splitRatio(s: string | undefined, n: number): (number | null)[] {
  if (!s) return Array(n).fill(null);
  return s.split('-').slice(0, n).map(p => {
    const v = parseFloat(p);
    return isFinite(v) ? v : null;
  });
}

function avgOf(vals: (number | null)[]): number | null {
  const xs = vals.filter((v): v is number => v !== null && isFinite(v));
  return xs.length > 0 ? xs.reduce((s, v) => s + v, 0) / xs.length : null;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function getUptimeRobotStats(): Promise<UptimeRobotData> {
  const apiKey = process.env.UPTIMEROBOT_API_KEY;
  if (!apiKey) {
    console.warn('[uptimerobot] UPTIMEROBOT_API_KEY not set at request time');
    return empty('UPTIMEROBOT_API_KEY not set');
  }

  try {
    const res = await fetchWithTimeout(
      'https://api.uptimerobot.com/v2/getMonitors',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
          api_key: apiKey,
          format: 'json',
          custom_uptime_ratios: '1-7-30',
          logs: '1',
          logs_limit: '10',
          response_times: '0',
        }),
        cache: 'no-store',
      },
      5000,
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('[uptimerobot] HTTP', res.status, txt.slice(0, 200));
      return empty(`UptimeRobot HTTP ${res.status}`);
    }

    const data = await res.json() as {
      stat?: string;
      error?: { type?: string; message?: string; parameter_name?: string };
      monitors?: Array<{
        id: number;
        friendly_name?: string;
        url?: string;
        status?: number;
        interval?: number;
        custom_uptime_ratio?: string;
        average_response_time?: string;
        logs?: Array<{ type: number; datetime: number; duration: number; reason?: { code?: string; detail?: string } }>;
      }>;
    };

    if (data.stat !== 'ok') {
      const apiMsg = data.error?.message || data.error?.type || 'unknown';
      console.error('[uptimerobot] API fail:', JSON.stringify(data.error || data));
      return empty(`UptimeRobot API: ${apiMsg}`);
    }

    const monitors: UptimeRobotMonitor[] = (data.monitors || []).map(m => {
      const [u24, u7, u30] = splitRatio(m.custom_uptime_ratio, 3);
      const downLog = (m.logs || []).find(l => l.type === 1);
      return {
        id: m.id,
        name: m.friendly_name || m.url || `monitor ${m.id}`,
        url: m.url || '',
        state: mapStatus(m.status ?? 0),
        intervalSec: m.interval ?? null,
        uptime24h: u24,
        uptime7d: u7,
        uptime30d: u30,
        avgResponseMs: m.average_response_time ? parseFloat(m.average_response_time) : null,
        lastIncident: downLog ? {
          at: downLog.datetime * 1000,
          durationSec: downLog.duration,
          reason: downLog.reason?.detail || downLog.reason?.code || '',
        } : null,
      };
    });

    if (monitors.length === 0) {
      console.warn('[uptimerobot] no monitors configured');
      return empty('No UptimeRobot monitors configured on this account');
    }

    const anyDown = monitors.some(m => m.state === 'down');
    const anyDegraded = monitors.some(m => m.state === 'degraded');
    const allOk = monitors.every(m => m.state === 'ok');
    const aggregateState: UptimeRobotState = anyDown ? 'down' : anyDegraded ? 'degraded' : allOk ? 'ok' : 'unknown';
    const latestDown = monitors
      .map(m => m.lastIncident)
      .filter((x): x is UptimeRobotIncident => x !== null)
      .sort((a, b) => b.at - a.at)[0] ?? null;

    return {
      available: true,
      reason: null,
      monitors,
      aggregate: {
        state: aggregateState,
        uptime24h: avgOf(monitors.map(m => m.uptime24h)),
        uptime7d: avgOf(monitors.map(m => m.uptime7d)),
        uptime30d: avgOf(monitors.map(m => m.uptime30d)),
        avgResponseMs: avgOf(monitors.map(m => m.avgResponseMs)),
        lastIncident: latestDown,
      },
    };
  } catch (err) {
    const msg = err instanceof Error
      ? (err.name === 'AbortError' ? 'timeout after 5s' : err.message)
      : String(err);
    console.error('[uptimerobot] fetch threw:', msg);
    return empty(`UptimeRobot fetch: ${msg}`);
  }
}
