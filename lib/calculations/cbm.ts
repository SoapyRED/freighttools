// ─────────────────────────────────────────────────────────────────
//  CBM (Cubic Metre) Calculator
//  CBM = (L cm × W cm × H cm) / 1,000,000
// ─────────────────────────────────────────────────────────────────

export interface CbmInput {
  /** Length of one piece in centimetres */
  lengthCm: number;
  /** Width of one piece in centimetres */
  widthCm: number;
  /** Height of one piece in centimetres */
  heightCm: number;
  /** Number of identical pieces (default 1) */
  pieces?: number;
}

export interface CbmResult {
  /** CBM for a single piece */
  cbmPerPiece: number;
  /** Total CBM for all pieces */
  totalCbm: number;
  /** Alias for totalCbm — explicit for API consumers */
  totalVolumeM3: number;
  /** Dimensions echoed back */
  dimensions: { lengthCm: number; widthCm: number; heightCm: number };
  /** Number of pieces */
  pieces: number;
  /** Equivalent in cubic feet (1 m³ = 35.3147 ft³) */
  cubicFeet: number;
  /** Equivalent in litres (1 m³ = 1,000 L) */
  litres: number;
  /** Equivalent in cubic inches (1 m³ = 61,023.7 in³) */
  cubicInches: number;
}

const M3_TO_FT3  = 35.3147;
const M3_TO_L    = 1000;
const M3_TO_IN3  = 61023.7;

export function calculateCbm(input: CbmInput): CbmResult {
  const { lengthCm, widthCm, heightCm, pieces = 1 } = input;

  const cbmPerPiece = parseFloat(
    ((lengthCm * widthCm * heightCm) / 1_000_000).toFixed(4)
  );
  const totalCbm = parseFloat((cbmPerPiece * pieces).toFixed(4));

  return {
    cbmPerPiece,
    totalCbm,
    totalVolumeM3: totalCbm,
    dimensions: { lengthCm, widthCm, heightCm },
    pieces,
    cubicFeet:    parseFloat((totalCbm * M3_TO_FT3).toFixed(4)),
    litres:       parseFloat((totalCbm * M3_TO_L).toFixed(2)),
    cubicInches:  parseFloat((totalCbm * M3_TO_IN3).toFixed(1)),
  };
}
