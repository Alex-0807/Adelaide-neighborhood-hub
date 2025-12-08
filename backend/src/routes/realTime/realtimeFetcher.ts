import { setVehicles, getVehicles } from "./vehiclesCache.js";

let intervalId: NodeJS.Timeout | null = null; // setinterval returns a NodeJS.Timeout in a Node environment

async function fetchAndUpdateVehicles() {
  try {
    const response = await fetch(
      "https://api.adelaidemetro.com.au/v1/vehicles?type=bus&format=json&apiKey=" +
        process.env.ADELAIDE_METRO_API_KEY
    );
    if (!response.ok) {
      console.error("Failed to fetch vehicle data:", response.statusText);
      return;
    }
    const data = await response.json();

    const vehicles = data.vehicles.map((v: any) => ({
      id: v.id,
      routeId: v.route_id,
      latitude: v.latitude,
      longitude: v.longitude,
      bearing: v.bearing,
      speed: v.speed,
      updatedAt: Date.now(),
    }));

    setVehicles(vehicles);
    console.log(`Fetched and updated ${vehicles.length} vehicles.`);
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
  }
}
export function startRealtimeFetcher() {
  if (intervalId) return; // already running
  fetchAndUpdateVehicles(); // initial fetch
  intervalId = setInterval(fetchAndUpdateVehicles, 15000); // fetch every 15 seconds
  console.log("Started real-time vehicle fetcher.");
}
