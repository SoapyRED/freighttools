# Observability — request-level audit logging

FreightUtils' REST API and MCP server emit one structured `[fu-audit]` JSON line per request to Vercel runtime logs. The log answers: *who is calling, what tool/endpoint they hit, from where, and how long it took* — without capturing any PII.

This powers internal audience analysis only. **Audit logs are not exposed to any third party.**

## What is logged

Every in-scope request — every REST route under `app/api/**` that handles a tool / lookup / calculator call, and every call to the MCP server at `/api/mcp` (and the canonical alias `/api/mcp/mcp`) — produces one line shaped like:

```
[fu-audit] {"timestamp":"2026-04-28T21:00:01.562Z","channel":"rest","route":"/api/adr","tool":null,"client":"unknown","country":"GB","region":"ENG","has_api_key":true,"status":200,"duration_ms":4}
```

Field reference:

| Field | Type | Notes |
|-------|------|-------|
| `timestamp` | string (ISO 8601) | server-side wall clock |
| `channel` | `"mcp"` \| `"rest"` | |
| `route` | string | URL pathname (e.g. `/api/adr`, `/api/mcp/mcp`) |
| `tool` | string \| null | MCP only — JSON-RPC `params.name` for `tools/call`, or the bare `method` for `initialize` / `tools/list` / etc. `null` for REST. |
| `client` | string | bucketed from User-Agent. One of `claude-desktop`, `cursor`, `smithery`, `n8n`, `zapier`, `make`, `postman`, `curl`, `browser`, `bot`, `unknown`. |
| `country` | string (ISO alpha-2) | from `x-vercel-ip-country` (Vercel edge geolocation). `unknown` locally. |
| `region` | string \| null | from `x-vercel-ip-country-region`. |
| `has_api_key` | boolean | true if `Authorization` or `X-API-Key` header was present. **Never logs the value, prefix, or hash.** |
| `status` | integer | HTTP response status code (4xx / 5xx errors are logged too). |
| `duration_ms` | integer | request entry → response return, rounded. |

## What is NOT logged

Nothing else. Specifically excluded:

- API key values, prefixes, or hashes
- Request bodies (parameters can include user-built tool inputs that may contain PII)
- Response bodies
- IP addresses
- User emails
- Any HTTP header value other than the country / region edge-geolocation tags

The log line contains no field that can identify an individual user. `country` / `region` are aggregated geographic signals, not personal location data.

## Sentry integration

Each audit emission also calls `Sentry.getCurrentScope().setTags({ channel, route, tool, client, country })`. The audit function does **not** capture a Sentry event itself — those tags exist purely as context so any error captured during the request inherits the audience-bucket information for triage.

The `beforeSend` hook in `sentry.server.config.ts` runs `redactSentryEvent()` (see `lib/sentry-redact.ts`) which strips query strings, cookies, auth headers, and known PII fields (email, api_key, apiKey, authorization, token, password, secret) before any event leaves the process.

## Querying the logs

In the Vercel CLI (project root):

```bash
# Live tail
vercel logs --follow | grep '\[fu-audit\]'

# Last N entries from a specific deployment
vercel logs <deployment-url-or-id> | grep '\[fu-audit\]' | tail -200

# Pipe to jq for shape-aware filtering
vercel logs <deployment-url-or-id> --since 1h \
  | grep -o '\[fu-audit\] .*$' \
  | sed 's/^\[fu-audit\] //' \
  | jq -r 'select(.channel == "mcp") | "\(.timestamp)  \(.client)  \(.tool)  \(.country)"'
```

Quick-look queries:

```bash
# Top 10 tool calls in the last hour
... | jq -r 'select(.channel == "mcp" and .tool != null) | .tool' | sort | uniq -c | sort -nr | head -10

# Country distribution
... | jq -r '.country' | sort | uniq -c | sort -nr

# Authenticated vs anonymous mix per route
... | jq -r '"\(.route)  \(.has_api_key)"' | sort | uniq -c | sort -nr
```

## Implementation

- **Library:** `lib/observability/audit.ts` — exports `withAuditRest`, `withAuditMcp`, plus the lower-level `auditRest` / `auditMcp` for tests.
- **Build-time enforcement:** `scripts/lint-audit.mjs` (wired as `npm run lint:audit`, chained into `npm run lint`) walks `app/api/**` and fails if any in-scope route file is missing the wrapper. Excludes are documented in the script header (auth, health, keys/register, cron, feedback, newsletter, subscribe, stripe, og, mcp alias).
- **Runtime smoke:** `scripts/smoke-test-audit.mjs` boots `next dev` on port 3099, hits one REST + one MCP endpoint, asserts each produced exactly one `[fu-audit]` line with the required shape, and asserts the `SMOKE_API_KEY` value never appears in either line. Run as needed:
  ```bash
  node scripts/smoke-test-audit.mjs
  ```

## Adding a new endpoint

When adding a new `app/api/**/route.ts`:

1. Import the wrapper:
   ```ts
   import { withAuditRest } from '@/lib/observability/audit';
   ```
2. Wrap your exported HTTP-method handlers:
   ```ts
   async function _handleGET(req: NextRequest) { ... }
   export const GET = withAuditRest(_handleGET);
   ```
3. If the new route is genuinely out-of-scope (admin, cron, payment webhook, etc.), add its path pattern to the `EXCLUDED_PATHS` array at the top of `scripts/lint-audit.mjs` with a one-line rationale.

The build-time lint will fail if you forget — see `FAULT-HISTORY-AND-PREVENTION.md`.
