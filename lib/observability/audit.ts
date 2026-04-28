/**
 * Per-request audit logging for the FreightUtils REST API + MCP server.
 *
 * Emits one structured `[fu-audit]` JSON line per request to stdout (Vercel
 * runtime logs) and tags Sentry's current scope with the same context so any
 * error captured during the request inherits client/route/country/tool tags.
 *
 * Privacy: NO bodies, NO API key values, NO IPs, NO emails. Only:
 *   - timestamp, channel, route, tool name (MCP only)
 *   - client bucket from User-Agent
 *   - country/region from Vercel's edge geolocation headers
 *   - has_api_key (boolean — never the value, prefix, or hash)
 *   - status, duration_ms
 *
 * Usage:
 *   - REST routes:  `export const GET = withAuditRest(handleGet)`
 *   - MCP route:    `export const POST = withAuditMcp('POST', mcpHandler)`
 *   - The lower-level `auditRest()` / `auditMcp()` are exported for tests.
 */

import * as Sentry from '@sentry/nextjs';

export type Channel = 'mcp' | 'rest';

export type Client =
  | 'claude-desktop'
  | 'cursor'
  | 'smithery'
  | 'n8n'
  | 'zapier'
  | 'make'
  | 'postman'
  | 'curl'
  | 'browser'
  | 'bot'
  | 'unknown';

export interface AuditLogEntry {
  timestamp: string;
  channel: Channel;
  route: string;
  tool: string | null;
  client: string;
  country: string;
  region: string | null;
  has_api_key: boolean;
  status: number;
  duration_ms: number;
}

// ─────────────────────────────────────────────────────────────
//  Field extraction
// ─────────────────────────────────────────────────────────────

function getPathname(req: Request): string {
  try {
    return new URL(req.url).pathname;
  } catch {
    return 'unknown';
  }
}

/**
 * Bucket a User-Agent string into one of the known client classes.
 * Order matters — more-specific patterns come first so e.g. claude-desktop
 * isn't classified as "browser" by virtue of its embedded webview UA.
 */
export function bucketUserAgent(ua: string | null | undefined): Client {
  if (!ua) return 'unknown';
  const u = ua.toLowerCase();

  // MCP clients first — most specific.
  if (u.includes('claude') && (u.includes('desktop') || u.includes('claude-ai'))) return 'claude-desktop';
  if (u.includes('cursor')) return 'cursor';
  if (u.includes('smithery')) return 'smithery';

  // Integration platforms.
  if (u.includes('n8n')) return 'n8n';
  if (u.includes('zapier')) return 'zapier';
  if (u.includes('make.com') || u.includes('integromat')) return 'make';

  // Devtools.
  if (u.includes('postmanruntime') || u.startsWith('postman')) return 'postman';
  if (u.startsWith('curl/') || u.includes(' curl/')) return 'curl';

  // Bots before browsers — some bots include browser-shaped UAs.
  if (u.includes('bot') || u.includes('crawl') || u.includes('spider') || u.includes('slurp')) return 'bot';

  // Browsers — broad final bucket.
  if (
    u.includes('mozilla') ||
    u.includes('chrome') ||
    u.includes('safari') ||
    u.includes('firefox') ||
    u.includes('edg/') ||
    u.includes('webkit')
  ) {
    return 'browser';
  }

  return 'unknown';
}

function hasApiKeyHeader(req: Request): boolean {
  return Boolean(req.headers.get('authorization') || req.headers.get('x-api-key'));
}

function getCountry(req: Request): string {
  return req.headers.get('x-vercel-ip-country') || 'unknown';
}

function getRegion(req: Request): string | null {
  return req.headers.get('x-vercel-ip-country-region') || null;
}

// ─────────────────────────────────────────────────────────────
//  Emit
// ─────────────────────────────────────────────────────────────

function buildEntry(
  req: Request,
  channel: Channel,
  status: number,
  durationMs: number,
  tool: string | null,
): AuditLogEntry {
  return {
    timestamp: new Date().toISOString(),
    channel,
    route: getPathname(req),
    tool,
    client: bucketUserAgent(req.headers.get('user-agent')),
    country: getCountry(req),
    region: getRegion(req),
    has_api_key: hasApiKeyHeader(req),
    status,
    duration_ms: Math.round(durationMs),
  };
}

function emit(entry: AuditLogEntry): void {
  // Tag Sentry's current scope so any error captured during the request
  // inherits this context. We deliberately do NOT capture an event here.
  try {
    Sentry.getCurrentScope().setTags({
      channel: entry.channel,
      route: entry.route,
      tool: entry.tool ?? '(none)',
      client: entry.client,
      country: entry.country,
    });
  } catch {
    // Sentry not initialised (e.g. in tests). Safe to swallow.
  }

  // Single structured line, prefixed for grep.
  // eslint-disable-next-line no-console
  console.log('[fu-audit]', JSON.stringify(entry));
}

export function auditRest(
  req: Request,
  ctx: { status: number; durationMs: number },
): void {
  emit(buildEntry(req, 'rest', ctx.status, ctx.durationMs, null));
}

export function auditMcp(
  req: Request,
  ctx: { tool: string | null; status: number; durationMs: number },
): void {
  emit(buildEntry(req, 'mcp', ctx.status, ctx.durationMs, ctx.tool));
}

// ─────────────────────────────────────────────────────────────
//  Higher-order wrappers
// ─────────────────────────────────────────────────────────────

/**
 * Wrap a Next.js App Router REST handler so every request emits a
 * `[fu-audit]` line including status + duration. Status of 500 is logged
 * if the inner handler throws (the error is re-thrown for Next.js to handle).
 *
 * The handler parameter is typed permissively so callers using `NextRequest`
 * (a `Request` subtype) don't trip TS contravariance. The wrapper only
 * reads `Request`-level properties (headers, url) before delegating, so any
 * Request-shaped object is safe at runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuditRest<H extends (...args: any[]) => unknown>(handler: H): H {
  const wrapped = async (req: Request, context?: unknown): Promise<Response> => {
    const start = Date.now();
    let status = 500;
    try {
      const res = (await (handler as (req: Request, ctx?: unknown) => unknown)(req, context)) as
        | Response
        | undefined;
      if (!res) {
        // Handler returned nothing — preserve Next.js's prior behaviour
        // (an empty 500 response) but at least emit an audit entry.
        status = 500;
        return new Response(null, { status: 500 });
      }
      status = res.status;
      return res;
    } catch (err) {
      status = 500;
      throw err;
    } finally {
      try {
        auditRest(req, { status, durationMs: Date.now() - start });
      } catch {
        /* never let logging failures break the request path */
      }
    }
  };
  return wrapped as unknown as H;
}

/**
 * Wrap an MCP transport handler. Reads the JSON-RPC body once to extract the
 * tool name, then reconstructs the Request so the inner handler can read the
 * body too. For non-POST methods (GET, DELETE on streamable-HTTP) the tool
 * field is null.
 */
export function withAuditMcp(
  method: string,
  handler: (req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const start = Date.now();
    let status = 500;
    let tool: string | null = null;
    let inner: Request = req;

    if (method === 'POST') {
      try {
        const body = await req.text();
        inner = new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body,
        });
        if (body) {
          const parsed: unknown = JSON.parse(body);
          if (parsed && typeof parsed === 'object') {
            const obj = parsed as Record<string, unknown>;
            const params = (obj.params as Record<string, unknown> | undefined) ?? undefined;
            if (obj.method === 'tools/call' && params && typeof params.name === 'string') {
              tool = params.name;
            } else if (typeof obj.method === 'string') {
              // initialize, tools/list, ping, notifications/*, etc.
              tool = obj.method;
            }
          }
        }
      } catch {
        // Body wasn't JSON or already consumed; tool stays null.
      }
    }

    try {
      const res = await handler(inner);
      status = res.status;
      return res;
    } catch (err) {
      status = 500;
      throw err;
    } finally {
      try {
        auditMcp(req, { tool, status, durationMs: Date.now() - start });
      } catch {
        /* never let logging failures break the request path */
      }
    }
  };
}
