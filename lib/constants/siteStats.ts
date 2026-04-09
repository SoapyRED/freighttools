// lib/constants/siteStats.ts
// SINGLE SOURCE OF TRUTH — update here, all pages update automatically

export const SITE_STATS = {
  toolCount: 17,
  apiEndpointCount: 18,
  mcpToolCount: 18,
  adrEntries: 2939,
  hsCodeCount: 6940,
  airlineCount: 6352,
  unlocodeCount: 116129,
  containerTypes: 5,
  incotermsCount: 11,
  cargoAirlines: 390,
  openApiVersion: '3.0.3',
  lastUpdated: 'April 2026',
  adrEdition: 'UNECE ADR 2025',
  hsEdition: 'WCO HS 2022',
  mcpVersion: '1.0.1',
} as const;

export const SITE_COPY = {
  statsLine: `${SITE_STATS.toolCount} tools \u00b7 ${SITE_STATS.adrEntries.toLocaleString()} ADR entries \u00b7 ${SITE_STATS.hsCodeCount.toLocaleString()} HS codes \u00b7 ${SITE_STATS.airlineCount.toLocaleString()} airlines \u00b7 ${SITE_STATS.unlocodeCount.toLocaleString()}+ locations \u00b7 OpenAPI ${SITE_STATS.openApiVersion} \u00b7 Updated ${SITE_STATS.lastUpdated}`,
  aboutDescription: `FreightUtils provides ${SITE_STATS.toolCount} free freight tools with ${SITE_STATS.apiEndpointCount} REST API endpoints, covering freight operations, dangerous goods compliance, customs & trade, and reference data.`,
} as const;
