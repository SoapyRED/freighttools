// ─────────────────────────────────────────────────────────────────
//  Chargeable Weight Calculator
//  Air freight: charge is based on whichever is HIGHER —
//  actual gross weight or volumetric (dimensional) weight.
// ─────────────────────────────────────────────────────────────────

export const DEFAULT_FACTOR = 6000; // IATA standard: 1 CBM = 166.67 kg

export interface ChargeableWeightInput {
  /** Length of one piece in centimetres */
  lengthCm: number;
  /** Width of one piece in centimetres */
  widthCm: number;
  /** Height of one piece in centimetres */
  heightCm: number;
  /** Total gross weight of all pieces combined, in kg */
  grossWeightKg: number;
  /** Number of identical pieces (default 1) */
  pieces?: number;
  /** Volumetric factor (default 6000 — IATA standard) */
  factor?: number;
}

export interface ChargeableWeightResult {
  /** Volumetric weight per single piece, in kg */
  volumetricWeightPerPieceKg: number;
  /** Total volumetric weight for all pieces, in kg */
  volumetricWeightTotalKg: number;
  /** Total gross weight of all pieces, in kg (same as input) */
  grossWeightKg: number;
  /** The chargeable weight — whichever of gross or volumetric is higher */
  chargeableWeightKg: number;
  /** Total cubic metres for all pieces */
  cbm: number;
  /** Which basis won: "volumetric" | "actual" */
  basis: 'volumetric' | 'actual';
  /** Ratio of CBM to actual tonne (cbm / (grossWeightKg / 1000)) */
  ratio: number | null;
  /** The volumetric factor used */
  factor: number;
  /** Number of pieces */
  pieces: number;
}

export function calculateChargeableWeight(
  input: ChargeableWeightInput
): ChargeableWeightResult {
  const {
    lengthCm,
    widthCm,
    heightCm,
    grossWeightKg,
    pieces = 1,
    factor = DEFAULT_FACTOR,
  } = input;

  // CBM: (L × W × H) cm³ → m³, multiplied by number of pieces
  const cbm = parseFloat(
    ((lengthCm * widthCm * heightCm * pieces) / 1_000_000).toFixed(6)
  );

  // Volumetric weight per piece: (L × W × H in cm³) / factor = kg
  const volPerPiece = parseFloat(
    ((lengthCm * widthCm * heightCm) / factor).toFixed(2)
  );

  // Total volumetric weight
  const volTotal = parseFloat((volPerPiece * pieces).toFixed(2));

  // Chargeable weight: higher of gross or volumetric
  const chargeableWeightKg = Math.max(grossWeightKg, volTotal);
  const basis: 'volumetric' | 'actual' =
    volTotal >= grossWeightKg ? 'volumetric' : 'actual';

  // Stowage factor / ratio: CBM per metric tonne (industry standard)
  const ratio =
    grossWeightKg > 0
      ? parseFloat((cbm / (grossWeightKg / 1000)).toFixed(3))
      : null;

  return {
    volumetricWeightPerPieceKg: volPerPiece,
    volumetricWeightTotalKg: volTotal,
    grossWeightKg,
    chargeableWeightKg,
    cbm,
    basis,
    ratio,
    factor,
    pieces,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Sea Freight W/M (Weight or Measure) Calculator
//  1 CBM = 1 revenue tonne (1,000 kg)
//  Carrier charges whichever is greater.
// ─────────────────────────────────────────────────────────────────

export interface SeaChargeableWeightResult {
  cbm: number;
  grossWeightKg: number;
  grossWeightTonnes: number;
  revenueTonnes: number;
  chargeableWeightKg: number;
  billingBasis: 'weight' | 'measure';
  ratio: number | null; // CBM per tonne (stowage factor)
  pieces: number;
}

export function calculateSeaChargeableWeight(input: ChargeableWeightInput): SeaChargeableWeightResult {
  const { lengthCm, widthCm, heightCm, grossWeightKg, pieces = 1 } = input;

  const cbm = parseFloat(((lengthCm * widthCm * heightCm * pieces) / 1_000_000).toFixed(6));
  const grossTonnes = parseFloat((grossWeightKg / 1000).toFixed(3));
  const revenueTonnes = parseFloat(Math.max(grossTonnes, cbm).toFixed(3));
  const chargeableWeightKg = parseFloat((revenueTonnes * 1000).toFixed(2));
  const billingBasis: 'weight' | 'measure' = cbm > grossTonnes ? 'measure' : 'weight';
  const ratio = grossWeightKg > 0 ? parseFloat((cbm / (grossWeightKg / 1000)).toFixed(3)) : null;

  return { cbm, grossWeightKg, grossWeightTonnes: grossTonnes, revenueTonnes, chargeableWeightKg, billingBasis, ratio, pieces };
}

/** Common volumetric factors for the UI dropdown */
export const VOLUMETRIC_FACTORS = [
  { value: 6000, label: '6000 — IATA standard (most airlines)' },
  { value: 5000, label: '5000 — Express carriers (FedEx, UPS, DHL)' },
  { value: 4000, label: '4000 — Some charter / specialist carriers' },
] as const;
