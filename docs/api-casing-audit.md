# API casing audit

Snapshot of the casing posture of every public REST endpoint after the snake_case migration sprint (commits `636bfb1` migration + `3e080d7`/`2b573eb`/`e506273`/this commit's hygiene rollup).

**Convention:** all public REST API responses use `snake_case` field names. Request/query parameter parsers continue to accept the historical `camelCase` aliases on a few POST endpoints for backwards compatibility — the snake_case forms are the documented canonical inputs.

## Endpoint posture

### Migrated 2026-04-25 (commit `636bfb1`)

These six were the camelCase outliers surfaced by the n8n v0.1.0 dogfood (bug list `bdbfef5`, B001). Each route now applies a boundary mapper (`toApiResponse` / `toContainerSpecResponse` / `toItemResponse` / etc.) immediately before `NextResponse.json` to translate the internal camelCase types to snake_case response shapes.

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/unlocode`  | snake_case | `locationCode/nameAscii/iataCode` → snake. Internal `UnlocodeEntry` type unchanged. |
| `/api/uld`       | snake_case | 8 fields renamed (`deck_position`, `external_dimensions`, `internal_dimensions`, `door_dimensions`, `max_gross_weight`, `tare_weight`, `usable_volume`, `compatible_aircraft`). Singular/plural shape (`result` vs `results`) preserved. |
| `/api/containers`| snake_case | 14 spec fields + 11 loading-fit fields. Three response shapes (bare object, `{container, loading}`, `{count, results}`) all snake. |
| `/api/vehicles`  | snake_case | 8 fields. Both single-vehicle (`{result}`) and list (`{count, results}`) modes. |
| `/api/consignment` (POST) | snake_case | ~20 fields across `items[]`, `totals`, `trailer`, `sea`, top-level. Request body still accepts `length`/`lengthCm`/`l`, `grossWeight`/`grossWeightKg`/`weight`/`gw` aliases. |
| `/api/duty` (POST) | snake_case | 13 fields. Request body still accepts `commodityCode`/`commodity_code`/`code`, `originCountry`/`origin_country`/`origin`, `customsValue`/`customs_value`/`value`, `freightCost`, `insuranceCost` aliases. |

### Already-clean (no migration needed)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/cbm`              | snake_case | `cbm_per_piece`, `total_cbm`, `meta.inputs.{length_cm, width_cm, height_cm}`. |
| `/api/ldm`              | snake_case | `ldm`, `vehicle.{name, length_m, max_payload_kg}`, `pallet_spaces.{used, available}`, `total_weight_kg`. |
| `/api/chargeable-weight`| snake_case | `chargeable_weight_kg`, `gross_weight_kg`, `volumetric_weight_kg`, `volumetric_weight_per_piece_kg`. Sea mode also returns `gross_weight_tonnes`, `revenue_tonnes`, `billing_basis`. |
| `/api/pallet`           | snake_case | `boxes_per_layer`, `total_boxes`, `usable_height_cm`, `utilisation_percent`, `total_box_volume_cbm`, `pallet_volume_cbm`, `wasted_space_cbm`, `total_weight_kg`, `remaining_weight_capacity_kg`. |
| `/api/convert`          | snake_case | `{input.{value, unit, name}, result.{value, unit, name}, formula}` — single-word keys throughout. |
| `/api/adr`              | snake_case | `un_number`, `proper_shipping_name`, `transport_category`, `packing_group`, `tunnel_restriction_code`, `hazard_identification_number`, etc. |
| `/api/adr-calculator`   | snake_case | `total_points`, `has_category_zero`, `has_quantity_exceedance`, `un_number`, `transport_category`. |
| `/api/adr/lq-check` (POST) | snake_case | `overall_status`, `lq_limit`, `lq_limit_value`, `lq_limit_unit`, `eq_code`, `quantity_entered`, `unit_entered`, `total_items`, `not_permitted`. |
| `/api/hs`               | snake_case | `results[].{hs_code, description, level, parent, section}`. **Was `hscode` until 636bfb1 boundary-mapped to `hs_code`.** |
| `/api/incoterms`        | snake_case | `code`, `name`, `slug`, `category`, `seller_responsibility`, `buyer_responsibility`. |
| `/api/airlines`         | snake_case | `airline_name`, `iata_code`, `icao_code`, `awb_prefix`, `has_cargo`, `aliases`, `verified`, `meta.last_verified`. |
| `/api/health`           | snake_case | `status`, `version`, `tools`, `endpoints`, `timestamp`. |
| `/api/tools`            | snake_case | `count`, `tools[].{name, endpoint, method, description, status}`, `meta.{base_url, docs, openapi, mcp}`. **`baseUrl → base_url` straggler fixed in `e506273`.** |
| `/api/auth/whoami`      | snake_case | `authenticated`, `tier`, `key_prefix` on 200; `error`, `message`, `upgrade_url`, `signup_url` on 401. |

### Intentionally exempt

| Path | Reason |
|------|--------|
| `/api/mcp/[transport]` | MCP protocol surface — not a JSON REST endpoint. Output fields (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`, `serverInfo`, `isError`, etc.) follow the Model Context Protocol spec, which is camelCase by convention. The `mcp-handler` library generates these. Lint exempts the file by the simple fact that it doesn't call `NextResponse.json`. |
| `/api/og` | Returns `ImageResponse` with JSX inline styles (`flexDirection`, `justifyContent`, `fontFamily`) — these are CSS-in-JS conventions, not API responses. Same exemption mechanism. |
| `/api/auth/verify` | Magic-link **session-cookie** auth callback. Returns redirects, no JSON body. Distinct concern from the API-key verification at `/api/auth/whoami`. |
| `/api/auth/login`, `/api/auth/logout` | Session-cookie auth, redirect-driven. No JSON response payload. |
| `/api/keys/register`, `/api/feedback`, `/api/newsletter/subscribe`, `/api/subscribe` | Internal admin / signup flows that POST to third-party services (Resend `audienceId`, etc.). Outbound request bodies use the third party's required casing; no public API consumer reads the response shape. |
| `/api/cron/status-ping`, `/api/cron/welcome-sequence` | Internal cron handlers; not public endpoints. |

### Request-body input parsers (left polyglot)

`/api/duty` and `/api/consignment` continue to accept `camelCase` aliases on input (`commodityCode || commodity_code`, `lengthCm || length_cm || length || l`, etc.) for backwards compatibility with the n8n + Zapier integrations published before the migration. The OpenAPI spec documents the snake_case forms as canonical. The fan-out sprint to those clients will retarget at the snake_case forms; once shipped, the camelCase aliases can be removed in a future hygiene pass.

## Enforcement going forward

Two layers, both run in CI:

1. **Build-time** — `scripts/lint-api-casing.mjs` (wired as `npm run lint:api-casing`, chained into `npm run lint`). Walks every `app/api/**/route.ts` via the TypeScript compiler API, finds every `NextResponse.json(body, init)` call, and recursively flags any `Identifier`-keyed property assignment in `body` that contains `[A-Z]`. Skips anything inside a `headers:` block (HTTP-header convention). Skips files that don't call `NextResponse.json` (covers `/api/mcp` and `/api/og`).
2. **Runtime** — `scripts/smoke-test.mjs` `test()` helper now runs `collectCamelCaseKeys` on every 2xx response and fails the row if any key contains `[A-Z]`. Catches the boundary-mapped responses the lint can't statically resolve, and any other dynamically-built responses (e.g. spread from a typed object whose keys aren't visible in route.ts).

Adding a new public endpoint that returns camelCase fails one of these two checks before reaching prod.

## Sprint provenance

| Commit | Sprint | Coverage |
|--------|--------|----------|
| `636bfb1` | Migration | The 6 outlier endpoints. |
| `3e080d7` | Hygiene rollup | Tool count SSOT (B003) + smoke assertion. |
| `2b573eb` | Hygiene rollup | `/api/auth/whoami` (B028). |
| `e506273` | Hygiene rollup | `/api/tools meta.baseUrl → meta.base_url` straggler. |
| (this commit) | Hygiene rollup | Site-wide smoke `snake_case` enforcement, build-time lint, this audit doc. |

## Out-of-scope follow-ups

- **n8n-nodes-freightutils** — output schemas / re-key client expressions to snake_case for unlocode, uld, containers, vehicles, consignment, duty.
- **freightutils-mcp** (npm package) — same.
- **Zapier app** — same; plus retarget the `authentication.test` from `/api/health` to `/api/auth/whoami`.
- These three land in the next fan-out sprint.
