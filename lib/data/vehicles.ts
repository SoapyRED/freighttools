export interface Vehicle {
  id: string;
  name: string;
  lengthM: number;
  widthM: number;           // internal trailer width — used as LDM divisor
  maxPayloadKg: number;
  euroPalletsFloor: number;
  blockPalletsFloor: number;
}

export const VEHICLES: Vehicle[] = [
  // European standard trailers (2.4m wide)
  { id: 'artic',   name: '13.6m Artic Trailer',   lengthM: 13.6,  widthM: 2.4,  maxPayloadKg: 24000, euroPalletsFloor: 33, blockPalletsFloor: 26 },
  { id: 'rigid10', name: '10m Rigid',              lengthM: 10.0,  widthM: 2.4,  maxPayloadKg: 12000, euroPalletsFloor: 20, blockPalletsFloor: 16 },
  { id: 'rigid75', name: '7.5t Rigid',             lengthM: 5.2,   widthM: 2.4,  maxPayloadKg: 3500,  euroPalletsFloor: 10, blockPalletsFloor: 8  },
  { id: 'luton',   name: '3.5t Luton Van',         lengthM: 4.0,   widthM: 2.4,  maxPayloadKg: 1200,  euroPalletsFloor: 6,  blockPalletsFloor: 5  },
  // North American trailers (2.59m / 102in wide)
  { id: 'us53',    name: '53ft US/Canada Trailer',  lengthM: 16.15, widthM: 2.59, maxPayloadKg: 20400, euroPalletsFloor: 40, blockPalletsFloor: 30 },
  { id: 'us48',    name: '48ft US Trailer',          lengthM: 14.63, widthM: 2.59, maxPayloadKg: 20400, euroPalletsFloor: 36, blockPalletsFloor: 26 },
];

export const VEHICLE_MAP: Record<string, Vehicle> = Object.fromEntries(
  VEHICLES.map(v => [v.id, v])
);
