import axios from "axios";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { TTLCache } from "../lib/ttlCache.js";

const BASE_URL =
  process.env.AM_GTFSRT_BASE_URL ?? "https://gtfs.adelaidemetro.com.au/v1";
const VEHICLE_POSITIONS_URL = `${BASE_URL}/realtime/vehicle_positions`;

type Vehicle = {
  entityId: string | null;
  tripId: string | null;
  routeId: string | null;
  vehicleId: string | null;
  label: string | null;
  timestamp: number | null;
  lat: number | null;
  lon: number | null;
  bearing: number | null;
  speed: number | null;
};

type VehiclePositionsPayload = {
  fetchedAt: string;
  entityCount: number;
  vehicles: Vehicle[];
};

const cache = new TTLCache<VehiclePositionsPayload>(10_000);

export async function getVehiclePositions(): Promise<{
  source: "cache" | "upstream";
  data: VehiclePositionsPayload;
}> {
  const cached = cache.get();
  if (cached) return { source: "cache", data: cached };
  //   console.log("Fetching vehicle positions from GTFS-RT feed...");
  try {
    const resp = await axios.get<ArrayBuffer>(VEHICLE_POSITIONS_URL, {
      responseType: "arraybuffer",
      timeout: 10_000,
    });
    console.log(
      `Fetched GTFS-RT feed: ${resp.data.byteLength} bytes, status ${resp.status}`,
    );

    let feedData = new Uint8Array(resp.data);

    // Check if the data is Base64 encoded (starts with alphanumeric, not binary control chars)
    // The captured log shows the data starts with "Cg...", which is Base64 for the header.
    const isLikelyBase64 =
      feedData[0] >= 0x20 && feedData[0] <= 0x7e && feedData.length > 0;

    if (isLikelyBase64) {
      try {
        const textDecoder = new TextDecoder();
        const str = textDecoder.decode(feedData);
        // Simple check: does it look like base64? (No whitespace, valid chars)
        // We trim to remove any potential newlines
        const trimmed = str.trim();
        if (/^[A-Za-z0-9+/]*={0,2}$/.test(trimmed)) {
          console.log("Detected Base64 encoded feed, decoding...");
          feedData = new Uint8Array(Buffer.from(trimmed, "base64"));
          console.log(`Decoded size: ${feedData.length} bytes`);
        }
      } catch (e) {
        // If text decoding fails, assume it's binary
        console.log("Data is not valid text, proceeding as binary.");
      }
    }

    console.log("Parsing GTFS-RT feed...");
    const feed =
      GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(feedData);
    console.log(`Parsed GTFS-RT feed: ${feed.entity?.length ?? 0} entities`);
    const vehicles: Vehicle[] = (feed.entity ?? [])
      .filter((e) => e.vehicle && e.vehicle.position)
      .map((e) => {
        const v = e.vehicle!;
        const pos = v.position!;
        console.log("Processing vehicle entity:", {
          entityId: e.id,
          tripId: v.trip?.tripId,
          routeId: v.trip?.routeId,
          vehicleId: v.vehicle?.id,
          label: v.vehicle?.label,
          timestamp: v.timestamp,
          lat: pos.latitude,
          lon: pos.longitude,
          bearing: pos.bearing,
          speed: pos.speed,
        });
        return {
          entityId: e.id ?? null,
          tripId: v.trip?.tripId ?? null,
          routeId: v.trip?.routeId ?? null,
          vehicleId: v.vehicle?.id ?? null,
          label: v.vehicle?.label ?? null,
          timestamp: v.timestamp ? Number(v.timestamp) : null,
          lat: pos.latitude ?? null,
          lon: pos.longitude ?? null,
          bearing: pos.bearing ?? null,
          speed: pos.speed ?? null,
        };
      });
    console.log(`Extracted ${vehicles.length} vehicles with position data`);
    const payload: VehiclePositionsPayload = {
      fetchedAt: new Date().toISOString(),
      entityCount: feed.entity?.length ?? 0,
      vehicles,
    };

    cache.set(payload);
    return { source: "upstream", data: payload };
  } catch (e) {
    console.error("Error fetching or parsing GTFS-RT feed:", e);
    throw e;
  }
}
