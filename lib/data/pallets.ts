export interface PalletPreset {
  id: string;
  name: string;
  lengthMm: number;
  widthMm: number;
}

export const PALLET_PRESETS: PalletPreset[] = [
  { id: 'euro',    name: 'Euro Pallet (EUR 1) — 1200 × 800 mm',    lengthMm: 1200, widthMm: 800  },
  { id: 'uk',      name: 'UK Standard (EUR 2) — 1200 × 1000 mm',   lengthMm: 1200, widthMm: 1000 },
  { id: 'half',    name: 'Half Pallet (EUR 6) — 800 × 600 mm',     lengthMm: 800,  widthMm: 600  },
  { id: 'quarter', name: 'Quarter Pallet — 600 × 400 mm',          lengthMm: 600,  widthMm: 400  },
];

export const PALLET_PRESET_MAP: Record<string, PalletPreset> = Object.fromEntries(
  PALLET_PRESETS.map(p => [p.id, p])
);
