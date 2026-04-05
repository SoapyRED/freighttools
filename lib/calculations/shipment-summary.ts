/**
 * Composite Shipment Summary — chains CBM, LDM, chargeable weight,
 * ADR compliance, and duty estimation into a single response.
 */

import type { ShipmentRequest, ShipmentSummaryResponse, ShipmentItem } from '@/lib/types/shipment';
import { lookupByUnNumber, normaliseUnNumber } from './adr';
import { calculateDuty } from './duty';

// ─── Constants ──────────────────────────────────────────────────

const AIR_FACTOR = 167;         // 1 CBM = 167 kg volumetric
const SEA_FACTOR = 1000;        // 1 CBM = 1 revenue tonne (1000 kg)
const ROAD_LDM_FACTOR = 1750;   // 1 LDM = 1750 kg
const TRAILER_WIDTH_CM = 240;
const TRAILER_LENGTH_M = 13.6;
const TRAILER_PAYLOAD_KG = 24000;

const CONTAINER_SPECS: Record<string, { cbm: number; payloadKg: number; name: string }> = {
  '20ft-standard':  { cbm: 33.2,  payloadKg: 28200, name: '20ft Standard' },
  '40ft-standard':  { cbm: 67.7,  payloadKg: 26680, name: '40ft Standard' },
  '40ft-high-cube': { cbm: 76.3,  payloadKg: 26460, name: '40ft High Cube' },
  '45ft-high-cube': { cbm: 86.0,  payloadKg: 25600, name: '45ft High Cube' },
};

// ─── Helpers ────────────────────────────────────────────────────

function round(n: number, dp = 2): number {
  return parseFloat(n.toFixed(dp));
}

function suggestVehicle(ldm: number, weightKg: number): string {
  if (ldm <= 4.0 && weightKg <= 1200) return '3.5t Luton Van';
  if (ldm <= 5.2 && weightKg <= 3500) return '7.5t Rigid';
  if (ldm <= 10.0 && weightKg <= 12000) return '18t Rigid';
  if (ldm <= 13.6 && weightKg <= 24000) return '13.6m Artic Trailer';
  return 'Multiple vehicles required';
}

function suggestContainer(cbm: number, weightKg: number): { name: string; count: number } {
  // Try 40HC first (most common), then 20ft, then 45ft
  const preferred = ['40ft-high-cube', '40ft-standard', '20ft-standard', '45ft-high-cube'];
  for (const key of preferred) {
    const spec = CONTAINER_SPECS[key];
    const byVolume = Math.ceil(cbm / spec.cbm);
    const byWeight = Math.ceil(weightKg / spec.payloadKg);
    const count = Math.max(byVolume, byWeight);
    if (count <= 5) return { name: spec.name, count };
  }
  const spec = CONTAINER_SPECS['40ft-high-cube'];
  return { name: spec.name, count: Math.max(Math.ceil(cbm / spec.cbm), Math.ceil(weightKg / spec.payloadKg)) };
}

// ─── Main calculation ───────────────────────────────────────────

export async function calculateShipmentSummary(req: ShipmentRequest): Promise<ShipmentSummaryResponse> {
  const { mode, items, origin, destination, incoterm, freightCost = 0, insuranceCost = 0, options } = req;
  const warnings: string[] = [];

  // ── Per-item aggregation ──────────────────────────────────
  let totalCbm = 0;
  let totalWeight = 0;
  let totalPieces = 0;
  let totalLdm = 0;
  let totalPalletSpaces = 0;
  const unNumbers: string[] = [];
  const hsCodes: string[] = [];
  let totalCustomsValue = 0;

  for (const item of items) {
    const cbm = round((item.length * item.width * item.height) / 1_000_000 * item.quantity);
    const weight = round(item.weight * item.quantity);
    totalCbm += cbm;
    totalWeight += weight;
    totalPieces += item.quantity;

    // LDM (road)
    const stackFactor = (item.stackable !== false) ? 2 : 1;
    const ldm = round((item.length * item.width * item.quantity) / (TRAILER_WIDTH_CM * 100) / stackFactor);
    totalLdm += ldm;

    // Pallet spaces
    const palletW = item.palletType === 'euro' ? 80 : item.palletType === 'uk' ? 100 : item.palletType === 'us' ? 102 : item.width;
    const palletsAcross = Math.floor(TRAILER_WIDTH_CM / palletW) || 1;
    totalPalletSpaces += Math.ceil(item.quantity / (stackFactor * palletsAcross));

    if (item.unNumber) unNumbers.push(item.unNumber);
    if (item.hsCode) hsCodes.push(item.hsCode);
    if (item.customsValue) totalCustomsValue += item.customsValue * item.quantity;

    if (!item.stackable && item.height > 180) {
      warnings.push(`${item.description || 'Item'}: height ${item.height}cm exceeds standard pallet height`);
    }
  }

  totalCbm = round(totalCbm);
  totalLdm = round(totalLdm);

  // ── Mode-specific calculations ────────────────────────────
  let chargeableWeight = 0;
  let billingBasis: 'weight' | 'volume' = 'weight';
  const modeSpecific: ShipmentSummaryResponse['modeSpecific'] = {};

  if (mode === 'road' || mode === 'multimodal') {
    const cwRoad = Math.max(totalWeight, round(totalLdm * ROAD_LDM_FACTOR));
    const utilPct = round((totalLdm / TRAILER_LENGTH_M) * 100);
    modeSpecific.loadingMetres = totalLdm;
    modeSpecific.palletSpaces = totalPalletSpaces;
    modeSpecific.trailerUtilisation = utilPct;
    modeSpecific.suggestedVehicle = suggestVehicle(totalLdm, totalWeight);
    modeSpecific.chargeableWeightRoad = cwRoad;
    chargeableWeight = cwRoad;
    billingBasis = cwRoad > totalWeight ? 'volume' : 'weight';

    if (totalLdm > TRAILER_LENGTH_M) warnings.push(`Total LDM (${totalLdm}m) exceeds 13.6m artic trailer`);
    if (totalWeight > TRAILER_PAYLOAD_KG) warnings.push(`Total weight (${totalWeight}kg) exceeds 24T payload limit`);
  }

  if (mode === 'air' || mode === 'multimodal') {
    const divisor = options?.volumetricDivisor ?? 6000;
    const factor = 1_000_000 / divisor; // 6000 → 166.67
    const volWeight = round(totalCbm * factor);
    const cwAir = Math.max(totalWeight, volWeight);
    modeSpecific.volumetricWeight = volWeight;
    modeSpecific.chargeableWeightAir = cwAir;
    if (mode === 'air') {
      chargeableWeight = cwAir;
      billingBasis = cwAir > totalWeight ? 'volume' : 'weight';
    }
  }

  if (mode === 'sea' || mode === 'multimodal') {
    const grossTonnes = round(totalWeight / 1000);
    const revenueTonnes = round(Math.max(grossTonnes, totalCbm));
    const cwSea = round(revenueTonnes * 1000); // back to kg
    const container = suggestContainer(totalCbm, totalWeight);
    modeSpecific.revenueTonnes = revenueTonnes;
    modeSpecific.suggestedContainer = container.name;
    modeSpecific.containerCount = container.count;
    modeSpecific.chargeableWeightSea = cwSea;
    if (mode === 'sea') {
      chargeableWeight = cwSea;
      billingBasis = totalCbm > grossTonnes ? 'volume' : 'weight';
    }
  }

  // For multimodal, use the highest chargeable weight
  if (mode === 'multimodal') {
    const candidates = [modeSpecific.chargeableWeightRoad, modeSpecific.chargeableWeightAir, modeSpecific.chargeableWeightSea].filter(Boolean) as number[];
    chargeableWeight = Math.max(...candidates);
    billingBasis = chargeableWeight > totalWeight ? 'volume' : 'weight';
  }

  // ── ADR compliance ────────────────────────────────────────
  let compliance: ShipmentSummaryResponse['compliance'];
  if (unNumbers.length > 0) {
    let totalPoints = 0;
    let exemptionApplicable = true;
    const multiplierMap: Record<string, number> = { '0': 0, '1': 50, '2': 3, '3': 1, '4': 0 };

    for (const un of unNumbers) {
      const norm = normaliseUnNumber(un);
      const entries = norm ? lookupByUnNumber(norm) : [];
      if (entries.length > 0) {
        const tc = entries[0].transport_category ?? '';
        if (tc === '0') exemptionApplicable = false;
        const mult = tc ? (multiplierMap[tc] ?? 0) : 0;
        // Approximate — uses item quantity as weight proxy
        const item = items.find(i => i.unNumber === un);
        const qty = item ? item.weight * item.quantity : 0;
        totalPoints += qty * mult;
      }
    }

    compliance = {
      hasDangerousGoods: true,
      adrFlags: {
        unNumbers: [...new Set(unNumbers)],
        totalPoints: round(totalPoints),
        exemptionApplicable: exemptionApplicable && totalPoints <= 1000,
      },
    };
    warnings.push('Dangerous goods detected — verify ADR compliance before transport');
  }

  // ── Customs / Duty estimation ─────────────────────────────
  let customs: ShipmentSummaryResponse['customs'];
  const dataVersion: ShipmentSummaryResponse['dataVersion'] = {};

  if (hsCodes.length > 0) {
    customs = { hsCodesPresent: true, canEstimateUkDuty: false };
    const destIsUk = destination?.country?.toUpperCase() === 'GB';
    const hasOrigin = !!origin?.country;

    if (destIsUk && hasOrigin && totalCustomsValue > 0) {
      customs.canEstimateUkDuty = true;
      try {
        const dutyResult = await calculateDuty({
          commodityCode: hsCodes[0], // Use first HS code for estimate
          originCountry: origin!.country,
          customsValue: totalCustomsValue,
          freightCost,
          insuranceCost,
          incoterm,
        });
        customs.dutyEstimate = {
          cifValue: dutyResult.cifValue,
          dutyRate: dutyResult.dutyRate,
          dutyAmount: dutyResult.dutyAmount,
          vatRate: dutyResult.vatRate,
          vatAmount: dutyResult.vatAmount,
          totalTaxes: dutyResult.totalImportTaxes,
        };
        dataVersion.duty = `GOV.UK Trade Tariff, fetched ${new Date().toISOString().slice(0, 10)}`;
      } catch {
        warnings.push('Could not estimate UK duty — verify commodity code');
        customs.canEstimateUkDuty = false;
      }
    }
  }

  if (unNumbers.length > 0) dataVersion.adr = 'UNECE ADR 2025';
  if (hsCodes.length > 0) dataVersion.hs = 'WCO HS 2022';

  return {
    mode,
    itemCount: items.length,
    totals: {
      pieces: totalPieces,
      grossWeight: totalWeight,
      volumeCBM: totalCbm,
      chargeableWeight,
      billingBasis,
    },
    modeSpecific,
    compliance,
    customs,
    warnings,
    disclaimer: 'Estimate only. Verify with your carrier, customs broker, or freight forwarder.',
    dataVersion,
  };
}
