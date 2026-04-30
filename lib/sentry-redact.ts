/**
 * Sentry beforeSend redactor — UK GDPR Article 32 + privacy contract.
 *
 * Scrubs every Sentry event before it leaves the runtime:
 *   - request.url query string truncated; query_string + cookies dropped
 *   - request.headers: Authorization + Cookie deleted
 *   - request.data, e.extra, e.contexts: walked recursively, any
 *     key matching the SENSITIVE set replaced with '[REDACTED]'
 *   - user.email -> '[redacted]', user.ip_address -> null (Article 32)
 *   - message + exception.value strings: substrings matching API key
 *     prefixes (fu_live_, fu_test_) and Stripe IDs (cus_, sub_, pi_, ch_,
 *     in_) collapsed to `<prefix>[redacted]`
 *
 * Imported by sentry.client/server/edge.config.ts as the beforeSend hook.
 * Exported as a pure function so scripts/sentry-redact-smoke.mjs can test
 * it without a Sentry SDK.
 */

const SENSITIVE = new Set([
  'email',
  'api_key',
  'apikey',
  'authorization',
  'token',
  'password',
  'secret',
]);

const FU_KEY_RE = /\b(fu_live|fu_test)_[A-Za-z0-9_]+/g;
const STRIPE_ID_RE = /\b(cus|sub|pi|ch|in)_[A-Za-z0-9]+/g;

function redactString(s: string): string {
  return s
    .replace(FU_KEY_RE, '$1_[redacted]')
    .replace(STRIPE_ID_RE, '$1_[redacted]');
}

// Loose shape — the function only mutates fields it recognises and leaves
// everything else alone. Avoids tight coupling to @sentry/nextjs's
// ErrorEvent type so the unit test in scripts/sentry-redact-smoke.mjs
// can construct partial events without satisfying the full Sentry shape.
type EventLike = Record<string, unknown> & {
  message?: string;
  exception?: { values?: Array<{ value?: string; type?: string }> };
  user?: Record<string, unknown> & {
    email?: string;
    ip_address?: string | null;
    id?: string;
    username?: string;
  };
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
  if (depth > 8 || value === null) return value;
  if (typeof value === 'string') return redactString(value);
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => walk(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE.has(k.toLowerCase()) ? '[REDACTED]' : walk(v, depth + 1);
  }
  return out;
}

export function redactSentryEvent<T>(event: T): T {
  // Treat as loose at the entry point — the function only mutates known
  // Sentry-shaped fields and leaves everything else untouched.
  const e = event as unknown as EventLike;

  // Top-level message
  if (typeof e.message === 'string') {
    e.message = redactString(e.message);
  }

  // Exception messages
  if (e.exception?.values) {
    for (const ex of e.exception.values) {
      if (typeof ex.value === 'string') ex.value = redactString(ex.value);
    }
  }

  // User identifiers
  if (e.user) {
    if (e.user.email) e.user.email = '[redacted]';
    e.user.ip_address = null;
    if (e.user.username) e.user.username = '[redacted]';
  }

  // Request scope
  const req = e.request;
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

  if (e.extra) {
    e.extra = walk(e.extra, 0) as Record<string, unknown>;
  }
  if (e.contexts) {
    e.contexts = walk(e.contexts, 0) as Record<string, unknown>;
  }

  return event;
}
