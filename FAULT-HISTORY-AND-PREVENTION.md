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

## Fault log

| Date | Issue | Root cause | Fix |
|------|-------|-----------|-----|
| 2026-04-09 | LQ/EQ Checker missing from OpenAPI spec and /api-docs | Checklist did not exist yet; endpoint was deployed without API documentation | Added POST /api/adr/lq-check to openapi.json and api-docs page; created this checklist |
