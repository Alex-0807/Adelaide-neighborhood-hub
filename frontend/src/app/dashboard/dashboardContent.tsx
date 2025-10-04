'use client';//use client could make the component a client component, so it could use browser api like useState, useEffect, etc.

import { useMemo, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NearbyEV from '@/components/EVList';
import EVMap from '@/components/EVMap';
import { log } from 'console';
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
export default function Dashboard() {
    const sp = useSearchParams();//searchParams could get the query params from the url
    const router = useRouter();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

    const params = useMemo(() => {
    const lat = Number(sp.get('lat'));
    const lng = Number(sp.get('lng'));
    const src = sp.get('src') ?? 'unknown';
    const distance_km = Number(sp.get('distance_km') ?? 88);
    
    const valid =
      Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    return { lat, lng, src,distance_km, valid };
  }, [sp]);//this useMemo could memoize the params object, so it only recalculates when sp changes

    const [stations, setStations] = useState<Item[]>([]);
    const [query, setQuery] = useState<{distance_km:number; max:number}>({distance_km:404,max:11});
    const [selectedId, setSelectedId] = useState<number>(107781);

 useEffect(() => {
  console.log(API_BASE);
  
  const loadStations = async () => {
    const qs = new URLSearchParams({
      lat: String(params.lat),
      lng: String(params.lng),
      distance_km: String(params.distance_km ?? 2),
      max: '10',
    });

    try{
      const resp = await fetch(`${API_BASE}/api/ev/nearby?${qs}`);
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      setStations(data.items);
      setQuery(data.query);
  }
    catch{
      alert('too many requests, please try again later');
    }
    


  };
  loadStations().catch(console.error);
}, [params.lat, params.lng, params.distance_km]);

  if (!params.valid) {
    return (
      <main className="p-6 space-y-3">
        <div className="text-red-600">invalid location</div>
        <button onClick={() => router.push('/')} className="underline">
          ← Back to Home
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <button onClick={() => router.push('/')} className="block mt-1 px-3 py-1 text-sm rounded bg-black text-white hover:bg-gray-600">
        ← Back to Home
      </button>

      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Central point: {params.lat.toFixed(6)}, {params.lng.toFixed(6)}（source：{params.src}）
        </div>
      </header>

      {/* EVMap */}
      <section className="h-[320px] min-w-[300px] rounded border grid place-items-center text-gray-500">
        <EVMap items={stations} center={{ lat: params.lat, lng: params.lng }}
        selectedId={selectedId} onSelect={setSelectedId} />
      </section>

      {/* 三个信息卡：今天先占位，先做 EV 的接口明天接 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <div className="font-semibold mb-1">EV Charging Station
            <NearbyEV items={stations} selectedId={selectedId} onSelect={setSelectedId}/>
            {/* <div className="bg-red-500 text-white p-4">testttttt</div> */}

          </div>
          <div className="text-sm text-gray-600">The backend will be invoked based on the current location./api/ev/nearby</div>
        </div>
        <div className="border rounded p-4">
          <div className="font-semibold mb-1">neraby public traffic</div>
          <div className="text-sm text-gray-600">Adelaide Metro GTFS-Realtime</div>
        </div>
        <div className="border rounded p-4">
          <div className="font-semibold mb-1">another section (later)</div>
          <div className="text-sm text-gray-600">PlanningAlerts（sorted by radius）</div>
        </div>
      </div>
    </main>
  );
}
