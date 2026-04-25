# Changelog

FreightUtils data updates, new tools, API changes, and MCP updates.
Subscribe via RSS: <https://www.freightutils.com/changelog.xml>

## 2026-04-25 (later — hygiene rollup)

- **API Change**: New endpoint `/api/auth/whoami` for credential verification (B028). Requires a valid API key in `X-API-Key` (or `Authorization: Bearer fu_…`, `?apiKey=`, `?api_key=`); returns `200 {authenticated: true, tier: free|pro, key_prefix}` (full key never echoed) or `401 {error: "unauthenticated", message, upgrade_url, signup_url}`. n8n and Zapier credential-test endpoints will retarget here in their next versions; current versions still hit `/api/health` (which keeps working but will green-tick any string).
- **API Fix**: `/api/health` `tools` field and `/api/tools` `count` field now match (B003 — was 18 vs 17). Both now derive from `lib/api-tools-registry.ts`, which is the single source of truth for the public REST tool registry. The missing tool was `ADR LQ/EQ Check` (added on 2026-04-09 but never added to the inline `/api/tools` array). Adding/removing a tool now propagates to both endpoints automatically.
- **API Fix**: `/api/tools` returns `meta.base_url` (was `meta.baseUrl`) — straggler from the snake_case migration earlier today.
- **Tooling**: `npm run lint:api-casing` (chained into `npm run lint`) walks every `app/api/**/route.ts` and fails the build if any `NextResponse.json` body contains a camelCase key. Pairs with the runtime smoke-test guard, which now enforces snake_case on every 2xx response site-wide (was only the six migrated endpoints). New endpoints can't ship with camelCase fields without one of the two layers catching it.
- **Docs**: `docs/api-casing-audit.md` snapshots the casing posture of every endpoint, the boundary-mapper pattern used for the migration, the four endpoints intentionally exempt (MCP transport, OG image, magic-link verify, internal admin/cron routes), and the enforcement architecture.

## 2026-04-25

- **API breaking change** — Six endpoints now return `snake_case` response fields, was `camelCase`. Affected: `/api/unlocode`, `/api/uld`, `/api/containers`, `/api/vehicles`, `/api/consignment`, `/api/duty`. Reason: site-wide consistency with the majority of endpoints (which already used `snake_case`) plus downstream client compatibility (Zapier and n8n both expect a single convention). The thirteen other endpoints are unchanged. Migration done now while traffic is near-zero. No deprecation/dual-output layer — clean break.

  Per-endpoint old → new field map:

  **`/api/unlocode`** (single-code lookup and search results) — `locationCode` → `location_code`, `nameAscii` → `name_ascii`, `iataCode` → `iata_code`. Unchanged: `code`, `country`, `name`, `subdivision`, `functions`, `status`, `coordinates`.

  **`/api/uld`** (single ULD via `?type=`, plus `?category=`, `?deck=`, and no-param list modes) — `deckPosition` → `deck_position`, `externalDimensions` → `external_dimensions`, `internalDimensions` → `internal_dimensions`, `doorDimensions` → `door_dimensions`, `maxGrossWeight` → `max_gross_weight`, `tareWeight` → `tare_weight`, `usableVolume` → `usable_volume`, `compatibleAircraft` → `compatible_aircraft`. Inner dimension keys (`length`, `width`, `height`) unchanged.

  **`/api/containers`** (spec lookup, list mode, plus loading-fit mode with `?l=&w=&h=`) — `internalLengthCm` → `internal_length_cm`, `internalWidthCm` → `internal_width_cm`, `internalHeightCm` → `internal_height_cm`, `capacityCbm` → `capacity_cbm`, `externalLengthCm` → `external_length_cm`, `externalWidthCm` → `external_width_cm`, `externalHeightCm` → `external_height_cm`, `doorWidthCm` → `door_width_cm`, `doorHeightCm` → `door_height_cm`, `tareWeightKg` → `tare_weight_kg`, `maxGrossKg` → `max_gross_kg`, `maxPayloadKg` → `max_payload_kg`, `euroPallets` → `euro_pallets`, `gmaPallets` → `gma_pallets`. Loading-fit-mode sub-object: `itemsPerRow` → `items_per_row`, `itemsPerCol` → `items_per_col`, `itemsPerLayer` → `items_per_layer`, `totalItemsFit` → `total_items_fit`, `itemsRequested` → `items_requested`, `allFit` → `all_fit`, `totalWeightKg` → `total_weight_kg`, `volumeUsedCbm` → `volume_used_cbm`, `volumeUtilisation` → `volume_utilisation`, `weightUtilisation` → `weight_utilisation`, `limitingFactor` → `limiting_factor`.

  **`/api/vehicles`** (single via `?slug=`, plus `?category=`, `?region=`, and no-param list) — `internalDimensions` → `internal_dimensions`, `doorDimensions` → `door_dimensions`, `maxPayload` → `max_payload`, `grossVehicleWeight` → `gross_vehicle_weight`, `euroPallets` → `euro_pallets`, `ukPallets` → `uk_pallets`, `usPallets` → `us_pallets`, `axleConfig` → `axle_config`. Inner dimension keys (`length`, `width`, `height`) unchanged.

  **`POST /api/consignment`** — items array: `dimensions.lengthCm/widthCm/heightCm` → `length_cm/width_cm/height_cm`, `grossWeightKg` → `gross_weight_kg`, `chargeableWeightAir/Road/Sea` → `chargeable_weight_air/road/sea`, `revenueTonnes` → `revenue_tonnes`, `palletSpaces` → `pallet_spaces`, `palletType` → `pallet_type`. Totals: same renames + `itemCount` → `item_count`, `pieceCount` → `piece_count`. Trailer block: `utilisationPercent` → `utilisation_percent`, `weightUtilisationPercent` → `weight_utilisation_percent`, `palletSpacesUsed/Available` → `pallet_spaces_used/available`. Sea: `suggestedContainer` → `suggested_container`, `containerCount` → `container_count`. Top-level: `billingBasis` → `billing_basis`, `suggestedVehicle` → `suggested_vehicle`. Request body input parser unchanged — still accepts `length`/`lengthCm`/`l`, `grossWeight`/`grossWeightKg`/`weight`/`gw`, etc. as aliases.

  **`POST /api/duty`** — `commodityCode` → `commodity_code`, `commodityDescription` → `commodity_description`, `originCountry` → `origin_country`, `originCountryName` → `origin_country_name`, `cifValue` → `cif_value`, `dutyRate` → `duty_rate`, `dutyRatePercent` → `duty_rate_percent`, `dutyAmount` → `duty_amount`, `vatRate` → `vat_rate`, `vatRatePercent` → `vat_rate_percent`, `vatAmount` → `vat_amount`, `totalImportTaxes` → `total_import_taxes`, `totalLandedCost` → `total_landed_cost`. Unchanged: `warnings`, `source`, `disclaimer`. Request body still accepts both `commodityCode` and `commodity_code` (and the other camelCase/snake aliases from before) — `snake_case` is now the documented form.

- **Docs**: OpenAPI spec at `/openapi.json` and the API docs page at `/api-docs` updated to the new shapes. The "Field Naming" section now reads "All endpoints use snake_case field names in responses."

- **Smoke test**: `scripts/smoke-test.mjs` gained a "snake_case-only guard" section that recursively asserts no response key contains a capital letter on each of the six migrated endpoints. The existing duty assertion was updated from `commodityCode` to `commodity_code`.

## 2026-04-09

- **New Tool**: ADR LQ/EQ Multi-Line Checker — Check Limited Quantity and Excepted Quantity eligibility for mixed dangerous goods consignments. Multi-item input with per-item breakdown, green/red/amber verdicts. POST /api/adr/lq-check.

## 2026-04-05

- **New Tool**: Air Freight ULD Type Reference — 15 unit load device types (AKE/LD3, PMC, PLA, and more). Dimensions, weights, volume, aircraft compatibility, deck positions. Free REST API at /api/uld.
- **New Tool**: Vehicle & Trailer Type Reference — 17 road freight vehicle and trailer types (curtainsiders, rigids, vans, US 53ft). Dimensions, payload limits, pallet capacity. Free REST API at /api/vehicles.
- **API Change**: Composite Shipment Summary Endpoint — POST /api/shipment/summary chains CBM, LDM, chargeable weight, ADR compliance, and UK duty estimation into one response. Accepts road/air/sea/multimodal modes.
- **API Change**: Sea Freight W/M Added to Calculators — Consignment calculator and chargeable weight calculator now support sea freight mode with W/M (Weight or Measure) at 1 CBM = 1 revenue tonne.
- **API Change**: Shipment Object Schema v1 — Canonical FreightUtils Shipment schema defined — the foundational data model for all composite endpoints.

## 2026-04-04

- **New Tool**: UK Import Duty & VAT Estimator — Estimate UK import duty and VAT for any commodity code using live GOV.UK Trade Tariff data. Supports Incoterm-adjusted CIF, preferential rate flagging, and cross-tool HS code workflow.
- **New Tool**: UN/LOCODE Lookup — 116,000+ transport locations from UNECE UN/LOCODE 2024-2. Searchable by name, code, country, and function type (port, airport, rail, road, ICD, border).
- **New Tool**: Multi-Item Consignment Calculator — Calculate total CBM, weight, LDM, and chargeable weight across mixed items. Available as web tool, REST API, and MCP tool.

## 2026-04-03

- **MCP Update**: Published to Official MCP Registry — FreightUtils MCP Server v1.0.1 now on registry.modelcontextprotocol.io. Also listed on Smithery.ai, mcp.so, and 5+ directories.
- **API Change**: MCP Remote SSE Endpoint Live — Connect AI agents to all FreightUtils tools at freightutils.com/api/mcp/mcp. Streamable HTTP transport via mcp-handler.

## 2026-04-02

- **API Change**: Rate Limits Updated to 100/day — Courtesy rate limit changed from 1,000/hour to 100 requests per day per IP across all API endpoints. Real enforcement via Vercel KV middleware.

## 2026-04-01

- **New Tool**: ADR 1.1.3.6 Exemption Calculator — Calculate ADR exemption thresholds for mixed hazardous loads. Supports multi-substance mixed-load calculation.
- **Data Update**: ADR 2025 Dataset — 2,939 dangerous goods entries from UNECE ADR 2025 edition (licensed from Labeline.com).
- **Data Update**: HS Code Dataset — 6,940 codes from WCO HS 2022 nomenclature with full section/chapter/heading hierarchy.
- **Data Update**: Airline Codes — 6,352 entries with IATA/ICAO codes and AWB prefixes. Cargo-only default view with 390 cargo airlines.

## 2026-03-15

- **New Tool**: FreightUtils.com Launched — 11 free freight tools with open REST APIs. LDM, CBM, chargeable weight, pallet fitting, container capacity, unit converter, ADR, airlines, INCOTERMS, HS codes.
- **API Change**: OpenAPI 3.0.3 Specification Published — Full OpenAPI spec covering all endpoints. Compatible with Swagger, Postman, and RapidAPI import.
- **Data Update**: INCOTERMS 2020 Reference Data — All 11 Incoterms with seller/buyer responsibilities, risk transfer, cost transfer, and insurance details.
