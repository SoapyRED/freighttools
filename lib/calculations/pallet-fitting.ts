// ─────────────────────────────────────────────────────────────────
//  Pallet Fitting Calculator
//  Layer-based greedy algorithm — models how warehouse staff
//  manually stack pallets (not 3D bin-packing).
//
//  Algorithm:
//    1. Try both box orientations on the pallet footprint
//    2. Pick whichever fits more boxes per layer
//    3. Multiply by floor(usableHeight / boxHeight) layers
//    4. Apply weight constraint if provided
// ─────────────────────────────────────────────────────────────────

export interface PalletFittingInput {
  /** Pallet length in cm */
  palletLengthCm: number;
  /** Pallet width in cm */
  palletWidthCm: number;
  /** Maximum total stack height in cm (floor to top of tallest box) */
  palletMaxHeightCm: number;
  /** Pallet board/deck height in cm (default 15) */
  palletHeightCm?: number;
  /** Box length in cm */
  boxLengthCm: number;
  /** Box width in cm */
  boxWidthCm: number;
  /** Box height in cm (the stacking dimension) */
  boxHeightCm: number;
  /** Weight per box in kg — used for weight constraint (optional) */
  boxWeightKg?: number;
  /** Maximum pallet payload weight in kg — used for weight constraint (optional) */
  maxPayloadWeightKg?: number;
  /** Allow 90° rotation of boxes on the pallet footprint (default true) */
  allowRotation?: boolean;
}

export interface BoxLayout {
  /** Number of boxes along the pallet length */
  boxesPerRow: number;
  /** Number of boxes along the pallet width */
  boxesPerCol: number;
  /** Total boxes in one layer */
  boxesPerLayer: number;
  /** Box dimension aligned with pallet length */
  usedBoxLengthCm: number;
  /** Box dimension aligned with pallet width */
  usedBoxWidthCm: number;
  /** True if boxes are rotated 90° vs input orientation */
  rotated: boolean;
}

export interface PalletFittingResult {
  /** Boxes that fit in one layer */
  boxesPerLayer: number;
  /** Number of layers that fit within the usable height */
  layers: number;
  /** Total boxes on the pallet */
  totalBoxes: number;
  /** Orientation used for the maximum-fit layout */
  orientation: 'original' | 'rotated';
  /** Detailed row/col breakdown for rendering */
  layout: BoxLayout;
  /** Usable height above the pallet deck in cm */
  usableHeightCm: number;
  /** Fraction of pallet footprint covered by boxes (0–100) */
  utilisationPercent: number;
  /** Volume of all boxes combined in m³ */
  totalBoxVolumeCbm: number;
  /** Usable pallet envelope volume (footprint × usable height) in m³ */
  palletVolumeCbm: number;
  /** Envelope volume not occupied by boxes in m³ */
  wastedSpaceCbm: number;
  /** True if result is constrained by weight rather than height */
  weightLimited: boolean;
  /** Total weight of all boxes in kg — null when no weight input provided */
  totalWeightKg: number | null;
  /** Remaining weight capacity in kg — null when no weight input provided */
  remainingWeightCapacityKg: number | null;
}

// ─── Internal helper ─────────────────────────────────────────────

function tryOrientation(
  palletL: number,
  palletW: number,
  boxL: number,
  boxW: number,
  rotated: boolean,
): BoxLayout {
  const usedL = rotated ? boxW : boxL;
  const usedW = rotated ? boxL : boxW;
  const boxesPerRow = Math.floor(palletL / usedL);
  const boxesPerCol = Math.floor(palletW / usedW);
  return {
    boxesPerRow,
    boxesPerCol,
    boxesPerLayer: boxesPerRow * boxesPerCol,
    usedBoxLengthCm: usedL,
    usedBoxWidthCm: usedW,
    rotated,
  };
}

// ─── Main export ─────────────────────────────────────────────────

export function calculatePalletFitting(input: PalletFittingInput): PalletFittingResult {
  const {
    palletLengthCm,
    palletWidthCm,
    palletMaxHeightCm,
    palletHeightCm = 15,
    boxLengthCm,
    boxWidthCm,
    boxHeightCm,
    boxWeightKg,
    maxPayloadWeightKg,
    allowRotation = true,
  } = input;

  const usableHeightCm = Math.max(0, palletMaxHeightCm - palletHeightCm);

  // ── Orientation selection ──────────────────────────────────────
  const layoutA = tryOrientation(palletLengthCm, palletWidthCm, boxLengthCm, boxWidthCm, false);

  const isSquareBox = boxLengthCm === boxWidthCm;
  const layoutB =
    allowRotation && !isSquareBox
      ? tryOrientation(palletLengthCm, palletWidthCm, boxLengthCm, boxWidthCm, true)
      : layoutA;

  const bestLayout = layoutB.boxesPerLayer > layoutA.boxesPerLayer ? layoutB : layoutA;

  // ── Layers by height ──────────────────────────────────────────
  const layersByHeight =
    bestLayout.boxesPerLayer > 0 && boxHeightCm > 0
      ? Math.floor(usableHeightCm / boxHeightCm)
      : 0;

  // ── Layers by weight ─────────────────────────────────────────
  let layers = layersByHeight;
  let weightLimited = false;

  if (
    boxWeightKg != null &&
    maxPayloadWeightKg != null &&
    bestLayout.boxesPerLayer > 0 &&
    boxWeightKg > 0
  ) {
    const maxBoxesByWeight = Math.floor(maxPayloadWeightKg / boxWeightKg);
    const layersByWeight = Math.floor(maxBoxesByWeight / bestLayout.boxesPerLayer);
    if (layersByWeight < layersByHeight) {
      layers = layersByWeight;
      weightLimited = true;
    }
  }

  const totalBoxes = bestLayout.boxesPerLayer * layers;

  // ── Utilisation (footprint) ───────────────────────────────────
  const palletFootprint = palletLengthCm * palletWidthCm;
  const boxedFootprint =
    bestLayout.usedBoxLengthCm * bestLayout.usedBoxWidthCm * bestLayout.boxesPerLayer;
  const utilisationPercent =
    palletFootprint > 0
      ? parseFloat(((boxedFootprint / palletFootprint) * 100).toFixed(1))
      : 0;

  // ── Volumes ──────────────────────────────────────────────────
  const singleBoxCbm = (boxLengthCm * boxWidthCm * boxHeightCm) / 1_000_000;
  const totalBoxVolumeCbm = parseFloat((singleBoxCbm * totalBoxes).toFixed(4));
  const palletVolumeCbm = parseFloat(
    ((palletLengthCm * palletWidthCm * usableHeightCm) / 1_000_000).toFixed(4),
  );
  const wastedSpaceCbm = parseFloat(
    Math.max(0, palletVolumeCbm - totalBoxVolumeCbm).toFixed(4),
  );

  // ── Weight output ─────────────────────────────────────────────
  const totalWeightKg =
    boxWeightKg != null
      ? parseFloat((boxWeightKg * totalBoxes).toFixed(2))
      : null;
  const remainingWeightCapacityKg =
    totalWeightKg != null && maxPayloadWeightKg != null
      ? parseFloat((maxPayloadWeightKg - totalWeightKg).toFixed(2))
      : null;

  return {
    boxesPerLayer: bestLayout.boxesPerLayer,
    layers,
    totalBoxes,
    orientation: bestLayout.rotated ? 'rotated' : 'original',
    layout: bestLayout,
    usableHeightCm,
    utilisationPercent,
    totalBoxVolumeCbm,
    palletVolumeCbm,
    wastedSpaceCbm,
    weightLimited,
    totalWeightKg,
    remainingWeightCapacityKg,
  };
}
