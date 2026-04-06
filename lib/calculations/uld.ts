import uldsData from '@/lib/data/ulds.json';

export interface ULDSpec {
  code: string;
  name: string;
  slug: string;
  category: 'container' | 'pallet' | 'special';
  deckPosition: 'lower' | 'main' | 'both';
  externalDimensions: { length: number; width: number; height: number };
  internalDimensions: { length: number; width: number; height: number } | null;
  doorDimensions: { width: number; height: number } | null;
  maxGrossWeight: number;
  tareWeight: number;
  usableVolume: number;
  compatibleAircraft: string[];
  notes: string;
}

const ALL_ULDS: ULDSpec[] = uldsData as ULDSpec[];
export const ULD_COUNT = ALL_ULDS.length;

/** Return every ULD in the dataset. */
export function getAllULDs(): ULDSpec[] {
  return ALL_ULDS;
}

/** Look up a single ULD by IATA code (e.g. "AKE") or slug (e.g. "ake-ld3"). */
export function getULD(code: string): ULDSpec | undefined {
  const c = code.toUpperCase();
  return ALL_ULDS.find(u => u.code === c || u.slug === code);
}

/** Filter ULDs by category: container | pallet | special. */
export function getULDsByCategory(cat: string): ULDSpec[] {
  return ALL_ULDS.filter(u => u.category === cat);
}

/** Filter ULDs by deck position: lower | main (includes "both"). */
export function getULDsByDeck(deck: string): ULDSpec[] {
  return ALL_ULDS.filter(u => u.deckPosition === deck || u.deckPosition === 'both');
}

/** Max payload = maxGrossWeight - tareWeight. */
export function getMaxPayload(uld: ULDSpec): number {
  return uld.maxGrossWeight - uld.tareWeight;
}
