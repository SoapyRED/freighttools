/**
 * UK Import Duty & VAT Estimator.
 * Calls GOV.UK Trade Tariff API for duty rates.
 */

// ─── Types ──────────────────────────────────────────────────────

export interface DutyInput {
  commodityCode: string;
  originCountry: string;
  customsValue: number;
  freightCost: number;
  insuranceCost: number;
  incoterm?: string;
}

export interface DutyWarning {
  type: 'info' | 'warn' | 'danger';
  message: string;
}

export interface DutyResult {
  commodityCode: string;
  commodityDescription: string;
  originCountry: string;
  originCountryName: string;
  cifValue: number;
  dutyRate: string;
  dutyRatePercent: number;
  dutyAmount: number;
  vatRate: string;
  vatRatePercent: number;
  vatAmount: number;
  totalImportTaxes: number;
  totalLandedCost: number;
  warnings: DutyWarning[];
  source: string;
  disclaimer: string;
}

// ─── CIF adjustment by Incoterm ─────────────────────────────────

// Incoterms where the seller has already paid freight to destination
const CIF_INCOTERMS = ['CIF', 'CIP', 'DAP', 'DPU', 'DDP', 'CFR', 'CPT'];

function calculateCIF(input: DutyInput): number {
  const { customsValue, freightCost, insuranceCost, incoterm } = input;
  // If the price already includes freight+insurance (CIF-type), don't double-count
  if (incoterm && CIF_INCOTERMS.includes(incoterm.toUpperCase())) {
    return customsValue; // Value already includes freight/insurance
  }
  // EXW, FCA, FOB, FAS — add freight + insurance
  return customsValue + freightCost + insuranceCost;
}

// ─── GOV.UK Trade Tariff API ────────────────────────────────────

const TARIFF_API = 'https://www.trade-tariff.service.gov.uk/api/v2';

interface TariffMeasure {
  id: string;
  type: string;
  relationships: {
    measure_type?: { data?: { id?: string } };
    geographical_area?: { data?: { id?: string } };
    duty_expression?: { data?: { id?: string } };
  };
}

interface TariffIncluded {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, unknown>;
}

interface TariffResponse {
  data: {
    attributes: {
      goods_nomenclature_item_id: string;
      description_plain: string;
      declarable: boolean;
    };
    relationships: {
      import_measures: { data: { id: string; type: string }[] };
    };
  };
  included: TariffIncluded[];
}

/**
 * Structured error thrown when a commodity code lookup fails.
 * Carries an optional hint and suggestion URL that the API route surfaces to clients.
 */
export class CommodityCodeNotFoundError extends Error {
  readonly code: string;
  readonly hint?: string;
  readonly suggestionUrl?: string;
  constructor(args: { code: string; message: string; hint?: string; suggestionUrl?: string }) {
    super(args.message);
    this.name = 'CommodityCodeNotFoundError';
    this.code = args.code;
    this.hint = args.hint;
    this.suggestionUrl = args.suggestionUrl;
  }
}

export async function fetchDutyRates(commodityCode: string, originCountry: string): Promise<{
  description: string;
  dutyRatePercent: number;
  dutySource: string;
  vatRatePercent: number;
  warnings: DutyWarning[];
  hasPreference: boolean;
}> {
  const rawCode = commodityCode.replace(/\s/g, '');
  const code = rawCode.padEnd(10, '0');
  const res = await fetch(`${TARIFF_API}/commodities/${code}`, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 86400 }, // Cache for 24h
  });

  if (!res.ok) {
    // If the user entered fewer than 10 digits, the padded code is often wrong —
    // the real 10-digit variant typically ends with e.g. "10" or "90", not "00".
    // Surface a helpful hint pointing them to the HS lookup.
    if (rawCode.length > 0 && rawCode.length < 10) {
      const parent8 = code.slice(0, 8);
      throw new CommodityCodeNotFoundError({
        code,
        message: `Commodity code '${code}' not found.`,
        hint: `UK import codes require the full 10-digit code with a specific product suffix. Parent code ${parent8} may have multiple 10-digit variants (e.g. ${parent8}10, ${parent8}90). Use the HS Code Lookup tool to find the correct 10-digit code for your product.`,
        suggestionUrl: `/hs?code=${parent8}`,
      });
    }
    throw new CommodityCodeNotFoundError({
      code,
      message: `Commodity code '${code}' not found in UK Trade Tariff.`,
      hint: 'Verify the code against the GOV.UK Trade Tariff or use the HS Code Lookup tool.',
      suggestionUrl: `/hs?code=${code.slice(0, 8)}`,
    });
  }

  const data = (await res.json()) as TariffResponse;
  const included = data.included || [];
  const description = data.data.attributes.description_plain || '';
  const importMeasureIds = data.data.relationships.import_measures.data.map(m => m.id);
  const measures = included.filter(
    (i): i is TariffIncluded & TariffMeasure => i.type === 'measure' && importMeasureIds.includes(i.id)
  ) as unknown as TariffMeasure[];

  const warnings: DutyWarning[] = [];
  let dutyRatePercent = 0;
  let dutySource = 'Third country duty';
  let vatRatePercent = 20; // Default UK VAT
  let hasPreference = false;

  // Helper to get duty expression base value
  const getDutyBase = (measureId: string): number | null => {
    const measure = measures.find(m => m.id === measureId);
    if (!measure) return null;
    const deId = measure.relationships?.duty_expression?.data?.id;
    if (!deId) return null;
    const de = included.find(i => i.id === deId);
    if (!de) return null;
    const base = String(de.attributes?.base ?? '');
    const match = base.match(/^([\d.]+)\s*%?$/);
    return match ? parseFloat(match[1]) : null;
  };

  // 1. Find third-country duty (type 103, geo 1011 = ERGA OMNES)
  const thirdCountryMeasure = measures.find(m => {
    const mt = m.relationships?.measure_type?.data?.id;
    const geo = m.relationships?.geographical_area?.data?.id;
    return mt === '103' && geo === '1011';
  });

  if (thirdCountryMeasure) {
    const rate = getDutyBase(thirdCountryMeasure.id);
    if (rate !== null) dutyRatePercent = rate;
  }

  // 2. Check for preferential rate for this specific country (type 142)
  const origin = originCountry.toUpperCase();
  const prefMeasure = measures.find(m => {
    const mt = m.relationships?.measure_type?.data?.id;
    const geo = m.relationships?.geographical_area?.data?.id;
    return mt === '142' && geo === origin;
  });

  if (prefMeasure) {
    const prefRate = getDutyBase(prefMeasure.id);
    if (prefRate !== null) {
      hasPreference = true;
      warnings.push({
        type: 'info',
        message: `Preferential duty rate of ${prefRate}% may apply for ${origin} (proof of origin required). Third-country rate of ${dutyRatePercent}% used as default.`,
      });
    }
  }

  // Also check group preferences (type 142 with group geo areas)
  if (!prefMeasure) {
    const groupPrefs = measures.filter(m => {
      const mt = m.relationships?.measure_type?.data?.id;
      const geo = m.relationships?.geographical_area?.data?.id;
      return mt === '142' && geo && /^\d{4}$/.test(geo);
    });
    // We can't easily determine if the origin country is in the group,
    // but flag it as a possibility
    if (groupPrefs.length > 0 && dutyRatePercent > 0) {
      warnings.push({
        type: 'info',
        message: 'Preferential rates may be available under a trade agreement. Check GOV.UK Trade Tariff for details.',
      });
    }
  }

  // 3. Find VAT (type 305, geo 1400)
  const vatMeasures = measures.filter(m => {
    const mt = m.relationships?.measure_type?.data?.id;
    return mt === '305';
  });

  for (const vm of vatMeasures) {
    const rate = getDutyBase(vm.id);
    if (rate !== null && rate > 0) {
      vatRatePercent = rate;
      break;
    }
  }

  // Check for zero-rated VAT
  const hasZeroVat = vatMeasures.some(m => {
    const rate = getDutyBase(m.id);
    return rate === 0;
  });
  const hasStdVat = vatMeasures.some(m => {
    const rate = getDutyBase(m.id);
    return rate !== null && rate > 0;
  });

  if (hasZeroVat && hasStdVat) {
    // Both exist — standard rate applies but zero may apply to specific uses
    // Keep standard rate
  } else if (hasZeroVat && !hasStdVat) {
    vatRatePercent = 0;
    warnings.push({ type: 'info', message: 'Zero-rated for VAT purposes.' });
  }

  // 4. Check for additional duties / trade remedies
  const additionalDuties = measures.filter(m => {
    const mt = m.relationships?.measure_type?.data?.id;
    const geo = m.relationships?.geographical_area?.data?.id;
    return (mt === '695' || mt === '552' || mt === '553') && (geo === origin || geo === '1011');
  });
  if (additionalDuties.length > 0) {
    warnings.push({ type: 'warn', message: 'Additional duties (anti-dumping or safeguard measures) may apply. Check GOV.UK Trade Tariff.' });
  }

  // 5. Check for import restrictions / prohibitions
  const restrictions = measures.filter(m => {
    const mt = m.relationships?.measure_type?.data?.id;
    const geo = m.relationships?.geographical_area?.data?.id;
    return (mt === '277' || mt === '711' || mt === '728') && (geo === origin || geo === '1011');
  });
  if (restrictions.length > 0) {
    warnings.push({ type: 'danger', message: 'Import restrictions or licensing requirements may apply for this commodity from this origin.' });
  }

  return { description, dutyRatePercent, dutySource, vatRatePercent, warnings, hasPreference };
}

// ─── Main calculation ───────────────────────────────────────────

export async function calculateDuty(input: DutyInput): Promise<DutyResult> {
  const { commodityCode, originCountry, customsValue, freightCost, insuranceCost } = input;

  const { description, dutyRatePercent, vatRatePercent, warnings } = await fetchDutyRates(commodityCode, originCountry);

  const cifValue = round(calculateCIF(input));
  const dutyAmount = round(cifValue * (dutyRatePercent / 100));
  const vatableAmount = cifValue + dutyAmount;
  const vatAmount = round(vatableAmount * (vatRatePercent / 100));
  const totalImportTaxes = round(dutyAmount + vatAmount);
  const totalLandedCost = round(customsValue + freightCost + insuranceCost + totalImportTaxes);

  // Get country name from the geo areas
  const countryName = COUNTRY_NAMES[originCountry.toUpperCase()] ?? originCountry;

  return {
    commodityCode: commodityCode.replace(/\s/g, '').padEnd(10, '0'),
    commodityDescription: description,
    originCountry: originCountry.toUpperCase(),
    originCountryName: countryName,
    cifValue,
    dutyRate: `${dutyRatePercent.toFixed(1)}%`,
    dutyRatePercent,
    dutyAmount,
    vatRate: `${vatRatePercent.toFixed(1)}%`,
    vatRatePercent,
    vatAmount,
    totalImportTaxes,
    totalLandedCost,
    warnings,
    source: 'GOV.UK Trade Tariff API',
    disclaimer: 'Estimate only. Not for customs declaration purposes. Verify with HMRC or a licensed customs broker.',
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Country names (subset for display) ─────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
  CN: 'China', US: 'United States', DE: 'Germany', FR: 'France', IT: 'Italy',
  JP: 'Japan', KR: 'South Korea', IN: 'India', GB: 'United Kingdom', NL: 'Netherlands',
  BE: 'Belgium', ES: 'Spain', TR: 'Turkey', PL: 'Poland', TW: 'Taiwan',
  TH: 'Thailand', VN: 'Vietnam', MY: 'Malaysia', ID: 'Indonesia', BD: 'Bangladesh',
  PK: 'Pakistan', BR: 'Brazil', MX: 'Mexico', RU: 'Russia', AU: 'Australia',
  CA: 'Canada', CH: 'Switzerland', SE: 'Sweden', AT: 'Austria', DK: 'Denmark',
  NO: 'Norway', FI: 'Finland', IE: 'Ireland', PT: 'Portugal', CZ: 'Czechia',
  RO: 'Romania', HU: 'Hungary', SK: 'Slovakia', BG: 'Bulgaria', HR: 'Croatia',
  SI: 'Slovenia', LT: 'Lithuania', LV: 'Latvia', EE: 'Estonia', GR: 'Greece',
  ZA: 'South Africa', EG: 'Egypt', NG: 'Nigeria', KE: 'Kenya', MA: 'Morocco',
  SA: 'Saudi Arabia', AE: 'United Arab Emirates', IL: 'Israel', SG: 'Singapore',
  HK: 'Hong Kong', PH: 'Philippines', NZ: 'New Zealand', CL: 'Chile', CO: 'Colombia',
  PE: 'Peru', AR: 'Argentina', UA: 'Ukraine', BY: 'Belarus',
};
