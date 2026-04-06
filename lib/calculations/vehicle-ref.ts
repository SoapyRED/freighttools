import vehiclesData from '@/lib/data/vehicles-ref.json';

export interface VehicleSpec {
  slug: string;
  name: string;
  category: 'articulated' | 'rigid' | 'van';
  region: 'EU' | 'US' | 'both';
  internalDimensions: { length: number; width: number; height: number };
  doorDimensions: { width: number; height: number } | null;
  maxPayload: number;
  grossVehicleWeight: number;
  euroPallets: number | null;
  ukPallets: number | null;
  usPallets: number | null;
  axleConfig: string;
  features: string[];
  notes: string;
}

const ALL_VEHICLES: VehicleSpec[] = vehiclesData as VehicleSpec[];
export const VEHICLE_REF_COUNT = ALL_VEHICLES.length;

export function getAllVehicles(): VehicleSpec[] {
  return ALL_VEHICLES;
}

export function getVehicle(slug: string): VehicleSpec | undefined {
  return ALL_VEHICLES.find(v => v.slug === slug);
}

export function getVehiclesByCategory(cat: string): VehicleSpec[] {
  return ALL_VEHICLES.filter(v => v.category === cat);
}

export function getVehiclesByRegion(region: string): VehicleSpec[] {
  const r = region.toUpperCase();
  return ALL_VEHICLES.filter(v => v.region === r || v.region === 'both');
}
