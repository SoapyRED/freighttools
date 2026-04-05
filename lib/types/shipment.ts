/**
 * FreightUtils Shipment Object — canonical schema v1
 *
 * This is the foundational data model for all composite endpoints.
 * Every composite endpoint accepts ShipmentRequest and returns
 * ShipmentSummaryResponse (or a subset of it).
 */

// ─── Request Types ──────────────────────────────────────────────

export interface ShipmentItem {
  description?: string;
  length: number;          // cm
  width: number;           // cm
  height: number;          // cm
  weight: number;          // kg gross per item
  quantity: number;
  stackable?: boolean;     // default true
  palletType?: 'euro' | 'uk' | 'us' | 'custom' | 'none';
  hsCode?: string;         // 6-10 digit HS/tariff code
  unNumber?: string;       // UN number for dangerous goods (e.g. "1203")
  customsValue?: number;   // per item, GBP
}

export interface ShipmentRequest {
  mode: 'road' | 'air' | 'sea' | 'multimodal';
  items: ShipmentItem[];
  origin?: {
    locode?: string;       // UN/LOCODE e.g. "GBLHR"
    country: string;       // ISO 2-letter
  };
  destination?: {
    locode?: string;
    country: string;
  };
  incoterm?: string;       // e.g. "FOB", "CIF", "EXW"
  freightCost?: number;    // GBP
  insuranceCost?: number;  // GBP
  options?: {
    vehicleType?: string;         // road: 'artic' | 'rigid10' | 'rigid75' | 'luton'
    containerType?: string;       // sea: '20ft-standard' | '40ft-standard' | '40ft-high-cube' | '45ft-high-cube'
    volumetricDivisor?: number;   // override default (air: 6000, sea: 1000)
  };
}

// ─── Response Types ─────────────────────────────────────────────

export interface ShipmentSummaryResponse {
  mode: string;
  itemCount: number;
  totals: {
    pieces: number;
    grossWeight: number;         // kg
    volumeCBM: number;           // m³
    chargeableWeight: number;    // kg — mode-specific
    billingBasis: 'weight' | 'volume';
  };
  modeSpecific: {
    // Road
    loadingMetres?: number;
    palletSpaces?: number;
    trailerUtilisation?: number; // percentage
    suggestedVehicle?: string;
    chargeableWeightRoad?: number;
    // Air
    volumetricWeight?: number;   // CBM × 167
    chargeableWeightAir?: number;
    // Sea
    revenueTonnes?: number;      // W/M at 1:1000
    suggestedContainer?: string;
    containerCount?: number;
    chargeableWeightSea?: number;
  };
  compliance?: {
    hasDangerousGoods: boolean;
    adrFlags?: {
      unNumbers: string[];
      totalPoints?: number;
      exemptionApplicable?: boolean;
    };
  };
  customs?: {
    hsCodesPresent: boolean;
    canEstimateUkDuty: boolean;
    dutyEstimate?: {
      cifValue: number;
      dutyRate: string;
      dutyAmount: number;
      vatRate: string;
      vatAmount: number;
      totalTaxes: number;
    };
  };
  warnings: string[];
  disclaimer: string;
  dataVersion: {
    adr?: string;
    hs?: string;
    duty?: string;
  };
}
