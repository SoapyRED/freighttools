import { VEHICLE_MAP, Vehicle } from '@/lib/data/vehicles';

export const TRAILER_WIDTH_M = 2.4;
export const EURO_PALLET_LDM = (1.2 * 0.8) / TRAILER_WIDTH_M; // 0.4 LDM

export interface LdmInput {
  lengthMm: number;
  widthMm: number;
  qty: number;
  stackable?: boolean;
  stackFactor?: number;        // 2 or 3
  weightPerPalletKg?: number | null;
  vehicleId?: string;          // 'artic' | 'rigid10' | 'rigid75' | 'luton'
  customVehicleLengthM?: number | null;
}

export interface LdmWarning {
  type: 'danger' | 'warn' | 'info';
  message: string;
}

export interface LdmResult {
  ldm: number;
  vehicle: {
    name: string;
    lengthM: number | null;
    maxPayloadKg: number | null;
  };
  utilisationPercent: number;
  palletSpaces: {
    used: number;
    available: number | null;
  };
  totalWeightKg: number | null;
  fits: boolean;
  warnings: LdmWarning[];
}

export function calculateLdm(input: LdmInput): LdmResult {
  const {
    lengthMm,
    widthMm,
    qty,
    stackable = false,
    stackFactor = 2,
    weightPerPalletKg = null,
    vehicleId = 'artic',
    customVehicleLengthM = null,
  } = input;

  const lengthM = lengthMm / 1000;
  const widthM = widthMm / 1000;
  const factor = stackable ? stackFactor : 1;

  // Core LDM formula
  const ldm =
    lengthM > 0 && widthM > 0 && qty > 0
      ? (lengthM * widthM * qty) / TRAILER_WIDTH_M / factor
      : 0;

  // Vehicle resolution
  const vehicle: Vehicle | null = VEHICLE_MAP[vehicleId] ?? null;
  const vehicleLengthM: number | null = vehicle?.lengthM ?? customVehicleLengthM ?? null;

  const vehicleInfo = {
    name: vehicle?.name ?? 'Custom Vehicle',
    lengthM: vehicleLengthM,
    maxPayloadKg: vehicle?.maxPayloadKg ?? null,
  };

  // Utilisation
  const utilisationPercent =
    vehicleLengthM && vehicleLengthM > 0
      ? parseFloat(((ldm / vehicleLengthM) * 100).toFixed(2))
      : 0;

  // Pallet spaces
  const palletSpacesUsed = Math.ceil(ldm / EURO_PALLET_LDM);
  const palletSpacesAvailable = vehicle?.euroPalletsFloor ?? null;

  // Total weight
  const totalWeightKg =
    weightPerPalletKg !== null && weightPerPalletKg !== undefined
      ? weightPerPalletKg * qty
      : null;

  // Fits?
  const fits = vehicleLengthM !== null ? ldm <= vehicleLengthM : true;

  // Warnings
  const warnings: LdmWarning[] = [];

  if (vehicleLengthM && ldm > vehicleLengthM) {
    warnings.push({
      type: 'danger',
      message: `Consignment (${ldm.toFixed(2)} LDM) exceeds vehicle length (${vehicleLengthM}m). Consider a larger vehicle or split the load.`,
    });
  } else if (utilisationPercent >= 85) {
    warnings.push({
      type: 'warn',
      message: `Load is ${utilisationPercent.toFixed(0)}% full — minimal room for load securing. Confirm with carrier.`,
    });
  }

  if (totalWeightKg !== null && vehicle?.maxPayloadKg) {
    if (totalWeightKg > vehicle.maxPayloadKg) {
      warnings.push({
        type: 'danger',
        message: `Overweight: ${totalWeightKg.toLocaleString()} kg exceeds ${vehicle.maxPayloadKg.toLocaleString()} kg payload limit.`,
      });
    } else if (totalWeightKg > vehicle.maxPayloadKg * 0.9) {
      warnings.push({
        type: 'warn',
        message: `Near weight limit: ${totalWeightKg.toLocaleString()} kg is within 10% of ${vehicle.maxPayloadKg.toLocaleString()} kg capacity.`,
      });
    }
  }

  return {
    ldm: parseFloat(ldm.toFixed(4)),
    vehicle: vehicleInfo,
    utilisationPercent,
    palletSpaces: {
      used: palletSpacesUsed,
      available: palletSpacesAvailable,
    },
    totalWeightKg,
    fits,
    warnings,
  };
}
