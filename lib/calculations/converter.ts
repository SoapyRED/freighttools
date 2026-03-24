/**
 * Weight & Dimension Converter
 * Bidirectional conversions for freight-relevant units
 */

export type UnitGroup = 'weight' | 'volume' | 'length' | 'freight';

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
  const fromUnit = UNITS[from];
  const toUnit = UNITS[to];

  if (!fromUnit) return { error: `Unknown unit "${from}". Valid: ${Object.keys(UNITS).join(', ')}` };
  if (!toUnit) return { error: `Unknown unit "${to}". Valid: ${Object.keys(UNITS).join(', ')}` };
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

// Common conversion pairs for SEO pages
export interface ConversionPair {
  slug: string;
  from: string;
  to: string;
  title: string;
  description: string;
}

export const CONVERSION_PAIRS: ConversionPair[] = [
  { slug: 'kg-to-lbs', from: 'kg', to: 'lbs', title: 'Kilograms to Pounds', description: 'Convert kg to lbs for freight weight calculations.' },
  { slug: 'lbs-to-kg', from: 'lbs', to: 'kg', title: 'Pounds to Kilograms', description: 'Convert lbs to kg for international shipping.' },
  { slug: 'cbm-to-cubic-feet', from: 'cbm', to: 'cuft', title: 'CBM to Cubic Feet', description: 'Convert cubic metres to cubic feet for US freight quotes.' },
  { slug: 'cubic-feet-to-cbm', from: 'cuft', to: 'cbm', title: 'Cubic Feet to CBM', description: 'Convert cubic feet to CBM for international shipping.' },
  { slug: 'tonnes-to-short-tons', from: 'tonnes', to: 'short_tons', title: 'Metric Tonnes to Short Tons', description: 'Convert metric tonnes to US short tons.' },
  { slug: 'cm-to-inches', from: 'cm', to: 'inches', title: 'Centimetres to Inches', description: 'Convert cm to inches for freight dimensions.' },
  { slug: 'm-to-feet', from: 'm', to: 'feet', title: 'Metres to Feet', description: 'Convert metres to feet for warehouse and trailer measurements.' },
  { slug: 'litres-to-gallons', from: 'litres', to: 'gal_us', title: 'Litres to US Gallons', description: 'Convert litres to US gallons.' },
];

export function getAllConversionSlugs(): string[] {
  return CONVERSION_PAIRS.map(p => p.slug);
}

export function lookupConversionPair(slug: string): ConversionPair | null {
  return CONVERSION_PAIRS.find(p => p.slug === slug) ?? null;
}

// Generate a common values table for a conversion pair
export function generateConversionTable(from: string, to: string): Array<{ input: number; output: number }> {
  const values = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  return values.map(v => {
    const r = convert(v, from, to);
    return { input: v, output: 'result' in r ? r.result.value : 0 };
  });
}
