# Incident: /api/airlines bulk-fetch spike

**Date:** 2026-04-24
**Severity:** Low (no outage, no data loss)
**Author:** Soap

## Summary

At ~21:21 UTC on 2026-04-24 a single residential IP in the `190.12.0.0/16` range began making sustained `GET /api/airlines` requests at ~5–10 req/min, exhausted the 25/day anonymous-IP cap inside 8 minutes, and continued requesting through 100+ application-layer 429s for ~30 minutes before Cloudflare's L7 rate-limit rule absorbed the cumulative spike at the edge. Total ~11K edge requests in the 40-minute window. Detected by Vercel Usage Anomaly notification at ~21:35 UTC (~14 minutes after onset). Resolved by ~22:00 UTC when traffic returned to baseline. Origin functions were never overloaded and no other users were impacted — per-IP usage keys isolated the spike. Application-layer defence gap (no short-window per-IP check on bulk-reference API endpoints) was closed in commit `e758fdf` plus the structured-429-body and 2xx-`X-RateLimit-Reset` follow-ups in this commit.

## Timeline

All times UTC.

| Time         | Event |
|--------------|-------|
| ~21:21       | First successful `GET /api/airlines` from `190.12.0.0/16`. |
| 21:21–21:29  | 8 × 200 in 8 minutes — exhausted the 25/day anonymous-IP cap. |
| ~21:29       | Daily anon cap engaged; `handleApiRateLimit` started returning 429 with `Retry-After` and `X-RateLimit-Reset`. |
| 21:29–22:00  | Source kept requesting at ~5–10 req/min for ~30 minutes despite 429s. 100+ 429s captured in runtime logs. No back-off, no `Retry-After` respect, no auth attempt. |
| ~21:35       | Vercel Usage Anomaly notification fired (cumulative ~11K edge requests crossing threshold). |
| 21:35–22:00  | Cloudflare layer-7 rate-limit rule began rejecting requests at the edge before they reached the function. |
| ~22:00       | Edge traffic back to baseline. Investigation began once the duty notification was acknowledged. |
| 2026-04-25   | Mitigation deployed: ScrapeGuard extended to bulk-reference API endpoints (commit `e758fdf`); structured 429 body + 2xx `X-RateLimit-Reset` headers (this commit). |

## Root cause

ScrapeGuard middleware enforced a tight 10 req / 5 min sliding-window check on **page routes** (`/hs/:path+`, `/adr/un/*`) but not on **bulk-reference API endpoints** (`/api/airlines`, `/api/unlocode`, `/api/hs`, `/api/adr`). Those endpoints relied solely on the daily/key-based limiter:

- 25 requests/day per anonymous IP
- 100 requests/day per free key
- 50,000 requests/month per Pro key

A scraper hitting `/api/airlines` from a single anonymous IP could fire 25 fast requests before the cap engaged, and the source dataset is 6,352 rows. With paging, 25 requests is enough to start meaningful enumeration. The threat model was originally framed around browser scraping (page routes) and overlooked the equivalent API surface — even though the API surface is the more scrape-attractive target by row count (airlines 6,352; UN/LOCODE 116,129; HS 6,940; ADR 2,939).

## Impact

- **Outage:** none. No 5xx, no data loss.
- **Other-user impact:** none. Per-IP usage keys isolated the spike — other anonymous users on shared egress saw normal service, all keyed users unaffected.
- **Vercel cost delta:** ~11K extra edge requests in the 40-minute window. Pro plan includes 1M edge requests/month — negligible at this scale; the **pattern** is the concerning signal, not the cost.
- **Origin function load:** unchanged. Vercel observability showed `/api/airlines` p95 flat through the window — Cloudflare absorbed traffic above the daily-cap engagement point.
- **KV writes:** ~108 `incr` calls to `usage:ip:190.12.x.x:2026-04-24` (one per request that reached the function), plus one `expire` on the first hit. Within KV free tier; no headroom concern.
- **Response time degradation:** none observed for legitimate users. The single source's own response times for 200s averaged ~70ms (consistent with cached airlines data) and 429s averaged ~25ms.

## What went well

- **Detection latency was acceptable** — Vercel Usage Anomaly fired ~14 min after onset at the cumulative-edge-request threshold.
- **Defence in depth held** — the application-layer 25/day cap engaged at request 25, and Cloudflare's L7 rule absorbed the residual. No origin function overload, no rate-limit-fairness degradation for other users.
- **Per-IP isolation worked as designed** — the usage-key scheme `usage:ip:<ip>:<date>` confined the spike to the single offending IP without affecting shared egress neighbours.
- **Forensic data was preserved cleanly** — runtime logs captured enough behavioural detail to fingerprint the source (sustained no-backoff, single endpoint, no auth attempt) without raw IPs leaking into the committed post-mortem.

## What went wrong

- **ScrapeGuard coverage gap.** The middleware enforced tight short-window limits on data **page** routes (`/hs/:path+`, `/adr/un/*`) but not on the equivalent bulk-reference **API** endpoints. The threat model was scoped to browser-based scraping and overlooked the API surface, which is more scrape-attractive by row count.
- **Unstructured 429 response body.** Clients received `error: "rate_limit_exceeded"` with conversion-oriented copy but no machine-readable `tier`, `limit` (as a number), `window`, or `reset_at` fields. A polite library client trying to parse the body to back off correctly would have had nothing to bind on.
- **No `X-RateLimit-Reset` on 2xx.** `handleApiRateLimit` and `handleScrapeProtection` both emitted `X-RateLimit-Limit` and `X-RateLimit-Remaining` on success but not the reset epoch. Polite clients couldn't pre-empt their cap by self-rate-limiting against the reset boundary — they could only react after the 429.
- **Vercel runtime-log MCP truncation.** The message body of `[RateLimit]` log lines came through truncated (`[RateLimit] usage:ip:190.12...`) so a full octet capture for the offending IP wasn't possible from the MCP-pulled fragments alone. Behavioural fingerprint was sufficient for this incident, but a future incident with multiple sources or finer-grained source breakdown would need a different log-extraction path (raw Vercel CLI logs, or Sentry-shipped events).

## Action items

- [x] **Extend ScrapeGuard to cover bulk-reference endpoints.** `/api/airlines`, `/api/unlocode`, `/api/hs`, `/api/adr` now subject to a 10 req / 5 min sliding-window per anonymous IP via `getBulkRefRatelimit`. API-keyed callers fall through to the existing daily/monthly limiter (Pro keys at 50k/month don't get clamped to 10/5min). Calculator endpoints (cbm, ldm, chargeable-weight, pallet, convert, consignment, duty, adr-calculator, adr/lq-check) and small reference sets (uld, containers, vehicles, incoterms — all <100 rows) explicitly excluded. Commit `e758fdf`.
- [x] **Add Cache-Control to bulk-reference endpoints.** `public, max-age=300, s-maxage=3600, stale-while-revalidate=86400` on `/api/airlines`, `/api/unlocode`, `/api/uld`, `/api/containers`, `/api/vehicles` via `next.config.ts` `headers()`. Aggressive CDN caching means repeat queries hit the edge cache, not the origin function. `/api/hs` and `/api/adr` already had route-handler-level Cache-Control with longer s-maxage; left alone. Commit `e758fdf`.
- [x] **Add structured 429 response body** with `error: "rate_limited"`, `tier` (`anon`/`free`/`pro`), `limit` (number), `window` (`1m`/`5m`/`day`/`month`), `reset_at` (ISO 8601), `upgrade_url`. Single helper (`buildStructuredRateLimit429` in `middleware.ts`) used from both `buildConversionRateLimitResponse` and `handleApiRateLimit`'s authenticated-429 path. Conversion-oriented affordances (`signup_url`, `docs_url`, `retry_after_seconds`) appended for anonymous callers via the helper's `extraBody` arg.
- [x] **Emit `X-RateLimit-Reset` on 2xx responses** alongside the existing `X-RateLimit-Limit` and `X-RateLimit-Remaining`. Added to `handleApiRateLimit`'s 2xx and `handleScrapeProtection`'s 2xx paths.
- [ ] **Sentry-backed observability for application-layer rate-limit events.** Currently logs to stdout only via `console.warn`/`console.log`; structured Sentry breadcrumbs or events would let us correlate spikes faster across endpoints and IP families and would survive Vercel runtime-log retention windows. Out of scope for this sprint.
- [ ] **Per-tier headroom monitoring on `/status`.** Surface a 5-min anonymous bulk-ref hit count so an active scrape is visible without trawling logs. Out of scope for this sprint.
- [ ] **WAF / bot-management upgrade.** Cloudflare Pro decision for managed-bot rules and a dedicated rate-limit budget. Separate sprint.

## Related code

- `middleware.ts` — `buildStructuredRateLimit429` helper, `getBulkRefRatelimit`, `isBulkRefApiRoute`, `tryBulkRefScrape`, `handleScrapeProtection`, `handleApiRateLimit`, dispatcher branching.
- `next.config.ts` — `headers()` block adding `Cache-Control` to bulk-reference endpoints.

## Forensic data retention

Raw per-IP detail and full message-body logs are not committed. `docs/incidents/2026-04-24-raw-logs.txt` (gitignored) holds the truncated fragments captured from the Vercel runtime-log MCP. Behavioural fingerprint summarised above (sustained 5–10 req/min for 39 min despite 429s, single endpoint, no back-off, no auth attempt) is consistent with a non-headless library client (`python-requests`-class) rather than a browser scraper or a polite library that respects `Retry-After`.
