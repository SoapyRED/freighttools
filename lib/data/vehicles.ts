export interface Vehicle {
  id: string;
  name: string;
  lengthM: number;
  maxPayloadKg: number;
  euroPalletsFloor: number;
  blockPalletsFloor: number;
}

export const VEHICLES: Vehicle[] = [
  { id: 'artic',   name: '13.6m Artic Trailer', lengthM: 13.6, maxPayloadKg: 24000, euroPalletsFloor: 33, blockPalletsFloor: 26 },
  { id: 'rigid10', name: '10m Rigid',            lengthM: 10.0, maxPayloadKg: 12000, euroPalletsFloor: 20, blockPalletsFloor: 16 },
  { id: 'rigid75', name: '7.5t Rigid',           lengthM: 5.2,  maxPayloadKg: 3500,  euroPalletsFloor: 10, blockPalletsFloor: 8  },
  { id: 'luton',   name: '3.5t Luton Van',       lengthM: 4.0,  maxPayloadKg: 1200,  euroPalletsFloor: 6,  blockPalletsFloor: 5  },
];

export const VEHICLE_MAP: Record<string, Vehicle> = Object.fromEntries(
  VEHICLES.map(v => [v.id, v])
);
