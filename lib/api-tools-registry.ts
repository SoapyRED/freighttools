/**
 * Single source of truth for the public REST API tool registry.
 *
 * Both /api/tools (full list with metadata) and /api/health (count only)
 * derive their answers from this array. Adding or removing a tool here
 * propagates to: the /api/tools response, the /api/health `tools` field,
 * SITE_STATS.toolCount (which is re-exported from this file's count), and
 * any UI copy that reads SITE_STATS.toolCount.
 */

export interface ToolInfo {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  description: string;
  status: 'active';
}

export const TOOLS: ToolInfo[] = [
  { name: 'LDM Calculator', endpoint: '/api/ldm', method: 'GET', description: 'Loading metres for road freight trailers', status: 'active' },
  { name: 'CBM Calculator', endpoint: '/api/cbm', method: 'GET', description: 'Cubic metres for shipping and logistics', status: 'active' },
  { name: 'Chargeable Weight', endpoint: '/api/chargeable-weight', method: 'GET', description: 'Air and sea freight chargeable weight', status: 'active' },
  { name: 'Pallet Fitting', endpoint: '/api/pallet', method: 'GET', description: 'Box-on-pallet fitting with layers and rotation', status: 'active' },
  { name: 'Container Capacity', endpoint: '/api/containers', method: 'GET', description: 'ISO container specs and loading calculation', status: 'active' },
  { name: 'Unit Converter', endpoint: '/api/convert', method: 'GET', description: 'Freight weight, volume, and length conversions', status: 'active' },
  { name: 'Consignment Calculator', endpoint: '/api/consignment', method: 'POST', description: 'Multi-item CBM, weight, LDM, and chargeable weight', status: 'active' },
  { name: 'ADR Dangerous Goods', endpoint: '/api/adr', method: 'GET', description: 'ADR 2025 dangerous goods lookup (2,939 entries)', status: 'active' },
  { name: 'ADR Exemption Calculator', endpoint: '/api/adr-calculator', method: 'GET', description: '1.1.3.6 small load exemption check', status: 'active' },
  { name: 'ADR LQ/EQ Check', endpoint: '/api/adr/lq-check', method: 'POST', description: 'Limited Quantity / Excepted Quantity eligibility for mixed consignments', status: 'active' },
  { name: 'HS Code Lookup', endpoint: '/api/hs', method: 'GET', description: 'Harmonized System tariff codes (6,940 codes)', status: 'active' },
  { name: 'INCOTERMS 2020', endpoint: '/api/incoterms', method: 'GET', description: 'International commercial terms reference', status: 'active' },
  { name: 'UK Duty & VAT', endpoint: '/api/duty', method: 'POST', description: 'UK import duty and VAT estimator (live GOV.UK data)', status: 'active' },
  { name: 'Airline Codes', endpoint: '/api/airlines', method: 'GET', description: 'Airline IATA/ICAO codes and AWB prefixes (6,352 airlines)', status: 'active' },
  { name: 'UN/LOCODE', endpoint: '/api/unlocode', method: 'GET', description: 'Transport location codes (116,129 locations)', status: 'active' },
  { name: 'ULD Types', endpoint: '/api/uld', method: 'GET', description: 'Air cargo unit load device specifications', status: 'active' },
  { name: 'Vehicle Types', endpoint: '/api/vehicles', method: 'GET', description: 'Road freight vehicle and trailer specifications', status: 'active' },
  { name: 'Shipment Summary', endpoint: '/api/shipment/summary', method: 'POST', description: 'Composite endpoint chaining multiple tools', status: 'active' },
];

export const TOOLS_COUNT = TOOLS.length;
