const SENSITIVE = new Set([
  'email',
  'api_key',
  'apikey',
  'authorization',
  'token',
  'password',
  'secret',
]);

type EventLike = {
  request?: {
    url?: string;
    query_string?: unknown;
    cookies?: unknown;
    headers?: Record<string, string> | Array<[string, string]>;
    data?: unknown;
  };
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
};

function walk(value: unknown, depth: number): unknown {
  if (depth > 8 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => walk(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE.has(k.toLowerCase()) ? '[REDACTED]' : walk(v, depth + 1);
  }
  return out;
}

export function redactSentryEvent<T extends EventLike>(event: T): T {
  const req = event.request;
  if (req) {
    if (typeof req.url === 'string') {
      const q = req.url.indexOf('?');
      if (q >= 0) req.url = req.url.slice(0, q);
    }
    req.query_string = undefined;
    req.cookies = undefined;
    if (req.headers && !Array.isArray(req.headers)) {
      const h = req.headers as Record<string, string>;
      for (const k of Object.keys(h)) {
        const lk = k.toLowerCase();
        if (lk === 'cookie' || lk === 'authorization') delete h[k];
      }
    }
    if (req.data !== undefined) {
      req.data = walk(req.data, 0);
    }
  }
  if (event.extra) {
    event.extra = walk(event.extra, 0) as Record<string, unknown>;
  }
  if (event.contexts) {
    event.contexts = walk(event.contexts, 0) as Record<string, unknown>;
  }
  return event;
}
