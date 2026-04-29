# Fault History & Prevention

## Checklist after adding any tool

When a new tool or endpoint is added to FreightUtils, verify **every** item below before merging to main:

- [ ] `siteStats.ts` — tool count and endpoint count updated
- [ ] Sitemap (`app/sitemap.ts`) — new page URL added
- [ ] Nav dropdown — tool appears in the correct dropdown group
- [ ] Homepage tool grid — tool listed with correct icon and description
- [ ] Footer links — tool appears in the correct footer column
- [ ] Changelog (`/changelog`) — entry added for the new tool
- [ ] OpenAPI spec (`public/openapi.json`) includes new endpoint with full request/response schema
- [ ] `/api-docs` page documents new endpoint with curl example and response example
- [ ] MCP server — tool registered if applicable (adr_lq_eq_check etc.)
- [ ] Page has sufficient educational content (min 200 words explaining what the tool does)
- [ ] GitHub repo README mentions new tool (manual — separate repo: SoapyRED/freightutils-mcp)
- [ ] npm package version considered for bump (manual)
- [ ] Postman collection updated with new endpoint
- [ ] `npm run build` passes with zero errors
- [ ] **Audit-wrapped**: every new `app/api/**/route.ts` MUST import `withAuditRest` (or `withAuditMcp` for the MCP transport route) from `@/lib/observability/audit` and apply it to its exported HTTP-method handlers. Genuine out-of-scope routes (admin, cron, payment webhook, OG image) must be added to `EXCLUDED_PATHS` in `scripts/lint-audit.mjs` with a one-line rationale. The `npm run lint:audit` build-time check will fail otherwise. See `docs/observability.md` for the privacy contract — NO request bodies, NO API key values, NO IPs, NO emails.
- [ ] **SEO metadata**: every new public page route MUST have `generateMetadata()` (or static `metadata` export for index pages) returning a title ≤60 chars (≤70 hard cap with the primary search keyword in the first 50 chars) and a meta description ≤155 chars. Description must contain "free" AND ("no login" OR "updated {year}"). For the four templated page families (HS code, ADR/UN, airline, container), use the builders in `lib/seo/page-metadata.ts` (`buildHsCodeMetadata` / `buildAdrUnMetadata` / `buildAirlineMetadata` / `buildContainerMetadata`) so all pages stay consistent. The `npm run lint:seo-titles` build-time check enforces this — it walks the four required builder usages, runs each builder against fixture sets covering long/short edge cases, and scans the four section-index pages for literal title/description matches. New page categories that need their own builder pattern should add a new `buildXxxMetadata` to `lib/seo/page-metadata.ts` and a fixture set + entry in `scripts/lint-seo-titles.mjs`.

## Fault log

| Date | Issue | Root cause | Fix |
|------|-------|-----------|-----|
| 2026-04-09 | LQ/EQ Checker missing from OpenAPI spec and /api-docs | Checklist did not exist yet; endpoint was deployed without API documentation | Added POST /api/adr/lq-check to openapi.json and api-docs page; created this checklist |
| 2026-04-28 | MCP `withLogging` was logging request body previews (up to 500 chars) — would have leaked user-built tool inputs (PII risk) | Initial MCP debug logger built before privacy contract was formalised | Replaced with `withAuditMcp` — structured `[fu-audit]` line, NO body preview, parses JSON-RPC just to extract the tool name. Added permanent `npm run lint:audit` check forcing every new in-scope route to wrap. See `docs/observability.md` for the privacy contract. |
| 2026-04-29 | GSC last 90 days showed pos 7-10 with ~0% CTR across the highest-impression queries (HS/ADR/airline/container pages — 17.5K US impressions / 9 clicks). US CTR 0.07% vs UK 0.94% on near-identical content suggested SERP-snippet weakness against stronger US competitors. | Title and meta description templates were generic and didn't surface the actual searched term (HS code number, UN number, airline IATA code, container type) early enough. Many titles also ran past 60 chars after the auto-template `%s | FreightUtils.com` suffix appended. | Added `lib/seo/page-metadata.ts` with four builders (`buildHsCodeMetadata`, `buildAdrUnMetadata`, `buildAirlineMetadata`, `buildContainerMetadata`) that return `title.absolute` to bypass the root template suffix and keep each title within ≤60 chars (≤70 hard cap with keyword in first 50). Wired all four detail pages and the four section indexes to the new patterns. Added permanent `npm run lint:seo-titles` build-time check (chained into `npm run lint`) that runs each builder against ~20 fixtures and scans the index pages for the required substrings. Patterns include "free" + "no login" / "updated YYYY" in every description. |
