/**
 * Multi-item consignment calculator.
 * Aggregates CBM, weight, LDM, and chargeable weight across mixed items.
 */

// ─── Constants ──────────────────────────────────────────────────

const TRAILER_WIDTH_CM = 240;
const TRAILER_LENGTH_M = 13.6;
const TRAILER_MAX_PAYLOAD_KG = 24000;
const TRAILER_PALLET_SPACES = 33;

const AIR_VOLUMETRIC_FACTOR = 167; // 1 CBM = 167 kg
const ROAD_LDM_FACTOR = 1750;     // 1 LDM = 1,750 kg
const SEA_FACTOR = 1000;           // 1 CBM = 1 revenue tonne (1,000 kg)

export type ConsignmentMode = 'road' | 'air' | 'sea';

const PALLET_TYPES: Record<string, { lengthCm: number; widthCm: number; label: string }> = {
  euro:   { lengthCm: 120, widthCm: 80,  label: 'Euro 120×80' },
  uk:     { lengthCm: 120, widthCm: 100, label: 'UK 120×100' },
  us:     { lengthCm: 122, widthCm: 102, label: 'US 48×40' },
};

// ─── Types ──────────────────────────────────────────────────────

export interface ConsignmentItemInput {
  description?: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  quantity: number;
  grossWeightKg: number;
  stackable?: boolean;
  palletType?: string; // 'none' | 'euro' | 'uk' | 'us' | 'custom'
}

export interface ConsignmentItemResult {
  description: string;
  dimensions: { lengthCm: number; widthCm: number; heightCm: number };
  quantity: number;
  cbm: number;
  grossWeightKg: number;
  ldm: number;
  chargeableWeightAir: number;
  chargeableWeightRoad: number;
  chargeableWeightSea: number;
  revenueTonnes: number;
  palletSpaces: number;
  stackable: boolean;
  palletType: string;
}

export interface ConsignmentWarning {
  type: 'danger' | 'warn' | 'info';
  message: string;
}

export interface ConsignmentResult {
  items: ConsignmentItemResult[];
  totals: {
    cbm: number;
    grossWeightKg: number;
    ldm: number;
    chargeableWeightAir: number;
    chargeableWeightRoad: number;
    chargeableWeightSea: number;
    revenueTonnes: number;
    palletSpaces: number;
    itemCount: number;
    pieceCount: number;
  };
  mode: ConsignmentMode;
  billingBasis: 'weight' | 'volume';
  trailer: {
    utilisationPercent: number;
    weightUtilisationPercent: number;
    palletSpacesUsed: number;
    palletSpacesAvailable: number;
    fits: boolean;
  };
  sea: {
    suggestedContainer: string;
    containerCount: number;
  };
  suggestedVehicle: string;
  warnings: ConsignmentWarning[];
}

// ─── Calculation ────────────────────────────────────────────────

export function calculateConsignment(inputs: ConsignmentItemInput[], mode: ConsignmentMode = 'road'): ConsignmentResult {
  const warnings: ConsignmentWarning[] = [];
  let totalCbm = 0;
  let totalWeight = 0;
  let totalLdm = 0;
  let totalChargeAir = 0;
  let totalChargeRoad = 0;
  let totalChargeSea = 0;
  let totalRevenueTonnes = 0;
  let totalPalletSpaces = 0;
  let totalPieces = 0;

  const items: ConsignmentItemResult[] = inputs.map((item, idx) => {
    const { lengthCm, widthCm, heightCm, quantity, grossWeightKg, stackable = false, palletType = 'none' } = item;
    const desc = item.description || `Item ${idx + 1}`;

    // CBM
    const cbmPerPiece = (lengthCm * widthCm * heightCm) / 1_000_000;
    const cbm = round(cbmPerPiece * quantity);

    // Gross weight
    const weight = round(grossWeightKg * quantity);

    // LDM — (L × W) / trailer width, adjusted for stackability
    const stackFactor = stackable ? 2 : 1;
    const ldm = round((lengthCm * widthCm * quantity) / (TRAILER_WIDTH_CM * 100) / stackFactor);

    // Chargeable weight (air): max of actual weight vs volumetric
    const volWeightAir = round(cbm * AIR_VOLUMETRIC_FACTOR);
    const chargeableWeightAir = Math.max(weight, volWeightAir);

    // Chargeable weight (road): max of actual weight vs LDM-based
    const ldmWeight = round(ldm * ROAD_LDM_FACTOR);
    const chargeableWeightRoad = Math.max(weight, ldmWeight);

    // Chargeable weight (sea): W/M — max of weight (tonnes) vs CBM, expressed as revenue tonnes
    const weightTonnes = round(weight / SEA_FACTOR);
    const revenueTonnes = round(Math.max(weightTonnes, cbm));
    const chargeableWeightSea = round(revenueTonnes * SEA_FACTOR);

    // Pallet spaces — based on pallet footprint or item footprint
    const pallet = PALLET_TYPES[palletType];
    const footprintL = pallet ? pallet.lengthCm : lengthCm;
    const footprintW = pallet ? pallet.widthCm : widthCm;
    const palletsAcross = Math.floor(TRAILER_WIDTH_CM / footprintW) || 1;
    const palletSpaces = Math.ceil(quantity / (stackFactor * palletsAcross));

    // Warnings per item
    if (!stackable && heightCm > 180) {
      warnings.push({ type: 'warn', message: `${desc}: height ${heightCm}cm exceeds standard pallet height (180cm)` });
    }

    totalCbm += cbm;
    totalWeight += weight;
    totalLdm += ldm;
    totalChargeAir += chargeableWeightAir;
    totalChargeRoad += chargeableWeightRoad;
    totalChargeSea += chargeableWeightSea;
    totalRevenueTonnes += revenueTonnes;
    totalPalletSpaces += palletSpaces;
    totalPieces += quantity;

    return {
      description: desc,
      dimensions: { lengthCm, widthCm, heightCm },
      quantity,
      cbm,
      grossWeightKg: weight,
      ldm,
      chargeableWeightAir,
      chargeableWeightRoad,
      chargeableWeightSea,
      revenueTonnes,
      palletSpaces,
      stackable,
      palletType: pallet?.label ?? (palletType === 'none' ? 'None' : palletType),
    };
  });

  // Round totals
  totalCbm = round(totalCbm);
  totalLdm = round(totalLdm);
  totalChargeAir = round(totalChargeAir);
  totalChargeRoad = round(totalChargeRoad);
  totalChargeSea = round(totalChargeSea);
  totalRevenueTonnes = round(totalRevenueTonnes);

  // Billing basis (mode-specific)
  let billingBasis: 'weight' | 'volume' = 'weight';
  if (mode === 'road') billingBasis = totalChargeRoad > totalWeight ? 'volume' : 'weight';
  else if (mode === 'air') billingBasis = totalChargeAir > totalWeight ? 'volume' : 'weight';
  else if (mode === 'sea') billingBasis = totalCbm > round(totalWeight / SEA_FACTOR) ? 'volume' : 'weight';

  // Sea container suggestion
  const seaContainer = suggestContainer(totalCbm, totalWeight);

  // Trailer utilisation
  const utilisationPercent = round((totalLdm / TRAILER_LENGTH_M) * 100);
  const weightUtilisationPercent = round((totalWeight / TRAILER_MAX_PAYLOAD_KG) * 100);
  const fits = totalLdm <= TRAILER_LENGTH_M && totalWeight <= TRAILER_MAX_PAYLOAD_KG;

  // Suggested vehicle
  const suggestedVehicle = suggestVehicle(totalLdm, totalWeight);

  // Grand warnings
  if (totalLdm > TRAILER_LENGTH_M) {
    warnings.push({ type: 'danger', message: `Total LDM (${totalLdm.toFixed(2)}m) exceeds 13.6m artic trailer. Multiple vehicles or a larger trailer required.` });
  }
  if (totalWeight > TRAILER_MAX_PAYLOAD_KG) {
    warnings.push({ type: 'danger', message: `Total weight (${totalWeight.toLocaleString()}kg) exceeds 24,000kg artic payload limit.` });
  }
  if (utilisationPercent >= 85 && utilisationPercent <= 100) {
    warnings.push({ type: 'warn', message: `Trailer ${utilisationPercent.toFixed(0)}% full — minimal room for load securing equipment.` });
  }

  return {
    items,
    totals: {
      cbm: totalCbm,
      grossWeightKg: totalWeight,
      ldm: totalLdm,
      chargeableWeightAir: totalChargeAir,
      chargeableWeightRoad: totalChargeRoad,
      chargeableWeightSea: totalChargeSea,
      revenueTonnes: totalRevenueTonnes,
      palletSpaces: totalPalletSpaces,
      itemCount: items.length,
      pieceCount: totalPieces,
    },
    mode,
    billingBasis,
    trailer: {
      utilisationPercent,
      weightUtilisationPercent,
      palletSpacesUsed: totalPalletSpaces,
      palletSpacesAvailable: TRAILER_PALLET_SPACES,
      fits,
    },
    sea: {
      suggestedContainer: seaContainer.name,
      containerCount: seaContainer.count,
    },
    suggestedVehicle,
    warnings,
  };
}

// ─── Helpers ────────────────────────────────────────────────────

function round(n: number, dp = 2): number {
  return parseFloat(n.toFixed(dp));
}

function suggestContainer(cbm: number, weightKg: number): { name: string; count: number } {
  const specs = [
    { name: '40ft High Cube', cbm: 76.3, payloadKg: 26460 },
    { name: '40ft Standard', cbm: 67.7, payloadKg: 26680 },
    { name: '20ft Standard', cbm: 33.2, payloadKg: 28200 },
  ];
  for (const s of specs) {
    const byVol = Math.ceil(cbm / s.cbm);
    const byWt = Math.ceil(weightKg / s.payloadKg);
    const count = Math.max(byVol, byWt);
    if (count <= 5) return { name: s.name, count };
  }
  const s = specs[0];
  return { name: s.name, count: Math.max(Math.ceil(cbm / s.cbm), Math.ceil(weightKg / s.payloadKg)) };
}

function suggestVehicle(ldm: number, weightKg: number): string {
  // Pick smallest vehicle that fits both LDM and weight
  if (ldm <= 4.0 && weightKg <= 1200) return '3.5t Luton Van';
  if (ldm <= 5.2 && weightKg <= 3500) return '7.5t Rigid';
  if (ldm <= 10.0 && weightKg <= 12000) return '18t Rigid';
  if (ldm <= 13.6 && weightKg <= 24000) return '13.6m Artic Trailer';
  return 'Multiple vehicles required';
}
