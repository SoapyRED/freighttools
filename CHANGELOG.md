# Changelog

FreightUtils data updates, new tools, API changes, and MCP updates.
Subscribe via RSS: <https://www.freightutils.com/changelog.xml>

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
