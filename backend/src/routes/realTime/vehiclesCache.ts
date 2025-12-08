export interface Vehicles {
  // interface can be extended, but type can't
  id: number;
  routeId: string; // route or line number
  latitude: number;
  longitude: number;
  bearing?: number; // optional: direction of travel
  speed?: number; // optional
  updatedAt: number; // timestamp (ms since epoch)
}

let currentVehicles: Vehicles[] = [];
let lastUpdateTime: number | null = null;

export function setVehicles(vehicles: Vehicles[]) {
  currentVehicles = vehicles;
  lastUpdateTime = Date.now();
}

export function getVehicles(): {
  vehicles: Vehicles[];
  lastUpdateTime: number | null;
} {
  return { vehicles: currentVehicles, lastUpdateTime: lastUpdateTime };
}
