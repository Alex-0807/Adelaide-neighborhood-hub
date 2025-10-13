"use client"; //use client could make the component a client component, so it could use browser api like useState, useEffect, etc.

import { useMemo, useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NearbyEV from "@/components/EVList";
import EVMap from "@/components/EVMap";
import { log } from "console";
// import { toast } from "@/components/ui/use-toast";

type Item = {
  id: number;
  title: string;
  lat: number;
  lng: number;
  address?: string;
  distanceKm?: number;
  status?: string;
  powerKW?: number;
  connectionType?: string;
};

export type Departure = {
  routeShort: string;
  headsign: string | null;
  etaMin: number;
  tripId: string;
  vehicleId: string | null;
  routeColor?: string;
};

// single stop
export type Stop = {
  stopId: string;
  name: string;
  lat: number;
  lng: number;
  distanceM: number;
  departures: Departure[];
};

export type TransitNearbyResponse = {
  center: { lat: number; lng: number };
  stops: Stop[];
  meta: {
    realtime: boolean;
    lastTripUpdatesAt: number | null;
    fetchedAt: number;
  };
};
export default function Dashboard() {
  const sp = useSearchParams(); //searchParams could get the query params from the url
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  const [backendReady, setBackendReady] = useState(false);
  const [stations, setStations] = useState<Item[]>([]);
  const [stops, setStops] = useState<TransitNearbyResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number>(107781);

  const params = useMemo(() => {
    const lat = Number(sp.get("lat"));
    const lng = Number(sp.get("lng"));
    const src = sp.get("src") ?? "unknown";
    const distance_km = Number(sp.get("distance_km") ?? 88);

    const valid =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180;
    return { lat, lng, src, distance_km, valid };
  }, [sp]); //this useMemo could memoize the params object, so it only recalculates when sp changes

  // if params are not valid, show an error message
  if (!params.valid) {
    return (
      <main className="p-6 space-y-3">
        <div className="text-red-600">invalid location</div>
        <button onClick={() => router.push("/")} className="underline">
          ← Back to Home
        </button>
      </main>
    );
  }

  async function checkBackendHealth() {
    //check if the backend is ready
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/health`
      );
      if (!resp.ok) throw new Error("Backend not ready");
      const data = await resp.json();
      return data.ok === true;
    } catch {
      return false;
    }
  }

  //check backend health every 500ms, once it's ready, set backendReady to true
  useEffect(() => {
    const interval = setInterval(async () => {
      const ok = await checkBackendHealth();
      if (ok) {
        setBackendReady(true);
        clearInterval(interval);
      }
    }, 500); // check every 500ms

    return () => clearInterval(interval);
  }, []);

  // fetch the nearby ev stations when params change
  useEffect(() => {
    console.log(API_BASE, "api base");

    const loadStations = async () => {
      const qs = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        distance_km: String(params.distance_km ?? 2),
        max: "10",
      });

      try {
        const resp = await fetch(`${API_BASE}/api/ev/nearby?${qs}`);
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        setStations(data.items);
      } catch {
        alert("too many requests, please try again later");
      }

      //fetch the station detail when params change
      try {
        const resp = await fetch(`${API_BASE}/api/transit/nearby?${qs}`);
      } catch {
        alert("failed to fetch transit data");
      }
    };
    loadStations().catch(console.error);
  }, [params.lat, params.lng, params.distance_km]);

  return (
    <main className="p-6 space-y-6">
      <div>
        {!backendReady ? (
          <p>🔄 Starting backend…</p>
        ) : (
          <p>✅ Backend started!</p>
        )}
      </div>
      <button
        onClick={() => router.push("/")}
        className="block mt-1 px-3 py-1 text-sm rounded bg-black text-white hover:bg-gray-600"
      >
        ← Back to Home
      </button>

      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Central point: {params.lat.toFixed(6)}, {params.lng.toFixed(6)}
          （source：{params.src}）
        </div>
      </header>

      {/* EVMap */}
      <section className="h-[320px] min-w-[300px] rounded border grid place-items-center text-gray-500">
        <EVMap
          items={stations}
          center={{ lat: params.lat, lng: params.lng }}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </section>

      {/* three sections*/}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <div className="font-semibold mb-1">
            EV Charging Station
            <NearbyEV
              items={stations}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <div className="text-sm text-gray-600">
            The backend will be invoked based on the current
            location./api/ev/nearby
          </div>
        </div>
        <div className="border rounded p-4">
          <div className="font-semibold mb-1">neraby public traffic</div>
          <div className="text-sm text-gray-600">
            Adelaide Metro GTFS-Realtime
          </div>
        </div>
        <div className="border rounded p-4">
          <div className="font-semibold mb-1">another section (later)</div>
          <div className="text-sm text-gray-600">
            PlanningAlerts（sorted by radius）
          </div>
        </div>
      </div>
    </main>
  );
}
