/**
 * Weight & Dimension Converter
 * Bidirectional conversions for freight-relevant units
 */

export type UnitGroup = 'weight' | 'volume' | 'length' | 'freight';

// Freight-specific virtual unit codes (cross-group conversions)
export const FREIGHT_CONVERSIONS: Record<string, { from: string; formula: (v: number) => number; note: string }> = {
  'cbm->chargeable_kg': {
    from: 'cbm',
    formula: (v) => Math.round(v * 166.67 * 100) / 100,
    note: 'IATA volumetric weight: 1 CBM = 166.67 kg (divisor 6000). Compare against actual weight — the higher figure is chargeable.',
  },
  'cbm->freight_tonnes': {
    from: 'cbm',
    formula: (v) => Math.round(v * 1 * 1000000) / 1000000,
    note: 'W/M rule: 1 CBM = 1 freight tonne (revenue tonne). Carrier charges whichever is greater — 1 CBM or 1,000 kg.',
  },
};

export interface UnitDef {
  code: string;
  name: string;
  group: UnitGroup;
  symbol: string;
}

export const UNITS: Record<string, UnitDef> = {
  kg:         { code: 'kg',         name: 'Kilograms',              group: 'weight',  symbol: 'kg' },
  lbs:        { code: 'lbs',        name: 'Pounds',                 group: 'weight',  symbol: 'lb' },
  oz:         { code: 'oz',         name: 'Ounces',                 group: 'weight',  symbol: 'oz' },
  tonnes:     { code: 'tonnes',     name: 'Metric Tonnes',          group: 'weight',  symbol: 't' },
  short_tons: { code: 'short_tons', name: 'Short Tons (US)',        group: 'weight',  symbol: 'ST' },
  long_tons:  { code: 'long_tons',  name: 'Long Tons (UK)',         group: 'weight',  symbol: 'LT' },
  cbm:        { code: 'cbm',        name: 'Cubic Metres',           group: 'volume',  symbol: 'm\u00B3' },
  cuft:       { code: 'cuft',       name: 'Cubic Feet',             group: 'volume',  symbol: 'ft\u00B3' },
  cuin:       { code: 'cuin',       name: 'Cubic Inches',           group: 'volume',  symbol: 'in\u00B3' },
  litres:     { code: 'litres',     name: 'Litres',                 group: 'volume',  symbol: 'L' },
  gal_us:     { code: 'gal_us',     name: 'US Gallons',             group: 'volume',  symbol: 'gal' },
  gal_uk:     { code: 'gal_uk',     name: 'Imperial Gallons (UK)',  group: 'volume',  symbol: 'gal' },
  cm:         { code: 'cm',         name: 'Centimetres',            group: 'length',  symbol: 'cm' },
  inches:     { code: 'inches',     name: 'Inches',                 group: 'length',  symbol: 'in' },
  m:          { code: 'm',          name: 'Metres',                 group: 'length',  symbol: 'm' },
  feet:       { code: 'feet',       name: 'Feet',                   group: 'length',  symbol: 'ft' },
  mm:         { code: 'mm',         name: 'Millimetres',            group: 'length',  symbol: 'mm' },
};

// Conversion factors to a common base unit per group
// Weight base: kg,  Volume base: cbm,  Length base: cm
const TO_BASE: Record<string, number> = {
  kg: 1, lbs: 0.453592, oz: 0.0283495, tonnes: 1000, short_tons: 907.185, long_tons: 1016.05,
  cbm: 1, cuft: 0.0283168, cuin: 0.0000163871, litres: 0.001, gal_us: 0.00378541, gal_uk: 0.00454609,
  cm: 1, inches: 2.54, m: 100, feet: 30.48, mm: 0.1,
};

export interface ConversionResult {
  input: { value: number; unit: string; name: string };
  result: { value: number; unit: string; name: string };
  formula: string;
}

export function convert(value: number, from: string, to: string): ConversionResult | { error: string } {
  // Check for freight-specific cross-group conversions first
  const freightKey = `${from}->${to}`;
  const freight = FREIGHT_CONVERSIONS[freightKey];
  if (freight) {
    const result = freight.formula(value);
    const fromUnit = UNITS[from];
    const toName = to === 'chargeable_kg' ? 'Chargeable Weight (kg)' : 'Freight Tonnes';
    const toSymbol = to === 'chargeable_kg' ? 'kg' : 'FT';
    return {
      input: { value, unit: from, name: fromUnit?.name ?? from },
      result: { value: result, unit: to, name: toName },
      formula: to === 'chargeable_kg'
        ? `${fromUnit?.name ?? from} \u00D7 166.67 = ${toName}`
        : `${fromUnit?.name ?? from} \u00D7 1 = ${toName}`,
      note: freight.note,
    } as ConversionResult & { note: string };
  }

  const fromUnit = UNITS[from];
  const toUnit = UNITS[to];

  if (!fromUnit) return { error: `Unknown unit "${from}". Valid: ${[...Object.keys(UNITS), 'chargeable_kg', 'freight_tonnes'].join(', ')}` };
  if (!toUnit) return { error: `Unknown unit "${to}". Valid: ${[...Object.keys(UNITS), 'chargeable_kg', 'freight_tonnes'].join(', ')}` };
  if (fromUnit.group !== toUnit.group) {
    return { error: `Cannot convert ${fromUnit.group} (${from}) to ${toUnit.group} (${to}). Units must be in the same category.` };
  }
  if (from === to) {
    return {
      input: { value, unit: from, name: fromUnit.name },
      result: { value, unit: to, name: toUnit.name },
      formula: `${from} = ${to} (same unit)`,
    };
  }

  const baseValue = value * TO_BASE[from];
  const result = baseValue / TO_BASE[to];
  const factor = TO_BASE[from] / TO_BASE[to];
  const rounded = Math.round(result * 1_000_000) / 1_000_000;

  return {
    input: { value, unit: from, name: fromUnit.name },
    result: { value: rounded, unit: to, name: toUnit.name },
    formula: `${fromUnit.name} \u00D7 ${factor.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')} = ${toUnit.name}`,
  };
}


// Generate a common values table for a conversion pair
export function generateConversionTable(from: string, to: string): Array<{ input: number; output: number }> {
  const values = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  return values.map(v => {
    const r = convert(v, from, to);
    return { input: v, output: 'result' in r ? r.result.value : 0 };
  });
}
