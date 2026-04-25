# 2026-04-24 — `/api/airlines` traffic spike

**Severity:** Vercel Usage Anomaly (no outage, no data loss)
**Time window:** 2026-04-24 21:21–22:00 UTC (~40 minutes)
**Resolution path:** Application-layer 429 (caught after 25 reqs from source) → Cloudflare layer-7 rate limit cut the 11K edge total → baseline traffic returned
**Status:** Closed; defence gap mitigated in the application layer post-incident.

## Timeline

| Time (UTC)    | Event |
|---------------|-------|
| ~21:21        | First successful `GET /api/airlines` from source IP (`190.12./16`). |
| 21:21–21:29   | 8 successful 200s in 8 minutes — exhausted the 25/day anonymous IP budget. |
| ~21:29        | Source crossed the 25-request anonymous daily cap; subsequent requests served 429 by application middleware (`handleApiRateLimit`). |
| 21:29–22:00   | Source continued requesting at ~5–10 req/min for 30 minutes despite 429 responses. 100+ 429s observed in the runtime logs. |
| ~21:35        | Vercel Usage Anomaly notification fired (11K edge requests in the cumulative window). |
| ~21:35–22:00  | Cloudflare layer-7 rate-limit rule began rejecting requests at the edge before they reached the function. |
| 22:00         | Edge traffic returned to baseline. |

## Traffic pattern

- **Cumulative edge requests:** ~11,000 across the 40-minute window (per Vercel dashboard).
- **Application-layer hits:** 8 × 200 + 100+ × 429 visible in runtime logs over the 21:21–22:00 window. The remaining edge requests were stopped at Cloudflare before reaching the function.
- **Endpoint shape:** every observed call was `GET /api/airlines` with a query parameter (likely `?prefix=` or similar — the `airlineLookup` smoke profile).
- **Velocity:** roughly steady ~5–10 requests/minute from a single source after the daily cap; no exponential ramp, no pause/back-off on receiving 429.

## Source analysis (aggregated)

- **IP /16 prefix:** `190.12.0.0/16` — Latin American residential range (matches the residential bands previously observed: `109.x`, `216.x`, `68.x`, `190.x`, `140.x`).
- **Distinct /16 prefixes seen in the window:** 1 (single source).
- **Residential overlap with prior-observed scraping ranges:** **100%** — the `190.x` band has been seen before.
- **User-Agent families:** the Vercel runtime-log MCP redacts the message body to a truncated form (`[RateLimit] usage:ip:190.12...`) so the UA isn't directly extractable from the captured logs. Behavioural fingerprint (sustained 5–10 req/min across 39 minutes despite 429s, single endpoint, no back-off, no auth attempt) is consistent with a non-headless library client (`python-requests`-class) rather than a browser scraper or a polite library that respects `Retry-After`.
- **Correlation with other endpoints:** in the same hour the Vercel dashboard recorded ~25 hits to `/api/mcp/[transport]` and ~50 hits to `/hs/code/*`. These are within normal background levels for those routes and showed no IP overlap with the `190.12.` source — they appear to be unrelated traffic.

Raw per-IP detail is not committed — see `docs/incidents/2026-04-24-raw-logs.txt` (gitignored) for the truncated fragments captured from Vercel MCP.

## Defence gap

ScrapeGuard middleware (`middleware.ts`) applied tight 10-req/5-min sliding-window rate limits to **page routes** (`/hs/:path+`, `/adr/un/:path*`) but **not to bulk-reference API endpoints** (`/api/airlines`, `/api/unlocode`, `/api/hs`, `/api/adr`). Those endpoints relied solely on the daily/key-based limiter:

- 25 requests/day per IP (anonymous)
- 100/day per free key
- 50,000/month per Pro key

A scraper hitting `/api/airlines` from a single anonymous IP could fire 25 fast requests before the cap engaged. With 5,000 unique IPs (or one IP and 200 days of patience), an attacker could pull the 6,352-row dataset across multiple budget windows.

The Cloudflare layer-7 rule did the heavy lifting, but the application layer was the second line of defence and it was missing on the bulk-reference data API surface — the most scrape-attractive endpoints by row count (airlines 6,352; UN/LOCODE 116,129; HS 6,940; ADR 2,939).

## Mitigation deployed

Same commit ships the application-layer fix:

1. **ScrapeGuard extended to bulk-reference API endpoints.** New `bulkRefRatelimit` (10 req / 5 min sliding-window per IP, prefix `scrape-rl-bulkref`) applied to:
   - `/api/airlines` and sub-paths
   - `/api/unlocode` and sub-paths
   - `/api/hs` and sub-paths
   - `/api/adr` (singular — sub-paths `/api/adr-calculator` and `/api/adr/lq-check` are calculators and explicitly excluded)
2. **Anonymous-only.** When a valid API key is present (header / query param), the bulk-ref check is skipped — Pro users at 50k/month don't hit a 10/5-min wall. Free-tier keyholders (100/day) similarly fall through to the existing daily limiter.
3. **Calculator endpoints unchanged.** `/api/cbm`, `/api/ldm`, `/api/chargeable-weight`, `/api/pallet`, `/api/convert`, `/api/consignment`, `/api/duty`, `/api/adr-calculator`, `/api/adr/lq-check` all still served at the existing daily/monthly limits — these are transactional and legitimate integrations call them frequently.
4. **Cache-Control hardened** on bulk-ref endpoints that previously had bare `Cache-Control: public`: now `public, max-age=300, s-maxage=3600, stale-while-revalidate=86400`. Aggressive CDN caching means scrapers hit the cache, not the origin function, on repeat queries within the s-maxage window. Browser-cache window kept short (5 min) so legitimate users see fresh data.
5. **`X-RateLimit-*` headers** continue to be emitted on every call by the daily limiter; the bulk-ref limiter adds its own values on the 429 response so the client sees the tighter window's `Retry-After` and limit.
6. **429 body** unchanged — same conversion-oriented JSON / branded HTML split based on `Accept` header. The existing copy already names the free tier (100/day) and Pro tier (£19/month, 50k/month) and routes to signup.

## Next steps (out of scope for this commit)

- **WAF / bot-management upgrade** — Cloudflare Pro decision, separate sprint.
- **Sentry-backed observability** for application-layer rate limit events — currently logs to stdout only; structured event would help correlate spikes faster.
- **Per-tier headroom monitoring** — surface a dashboard in `/status` (or admin-only) showing the 5-min anonymous bulk-ref hit count so an active scrape is visible without scraping logs.

## Related code

- `middleware.ts` — `bulkRefRatelimit` getter, `isBulkRefScrapeRoute`, `tryBulkRefScrape`, dispatcher branching.
- `next.config.ts` — `headers()` block adding `Cache-Control` to bulk-ref endpoints.
- Originally referenced commits (HTML-vs-JSON 429 split, page-route ScrapeGuard): `4e3a0eb`, `710e7bb`, `685e49a`.
