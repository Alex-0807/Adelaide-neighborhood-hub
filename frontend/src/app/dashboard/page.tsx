'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NearbyEV from '@/components/EVList';
import EVMap from '@/components/EVMap';
export default function Dashboard() {
  const sp = useSearchParams();
  const router = useRouter();

  const params = useMemo(() => {
    const lat = Number(sp.get('lat'));
    const lng = Number(sp.get('lng'));
    const src = sp.get('src') ?? 'unknown';
    const distance_km = Number(sp.get('distance_km') ?? 88);
    const valid =
      Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    return { lat, lng, src,distance_km, valid };
  }, [sp]);

  if (!params.valid) {
    return (
      <main className="p-6 space-y-3">
        <div className="text-red-600">坐标无效或缺失。</div>
        <button onClick={() => router.push('/')} className="underline">
          ← 返回首页重新选择位置
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <button onClick={() => router.push('/')} className="underline">
        ← 重新选择位置
      </button>

      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-600">
          中心点：{params.lat.toFixed(6)}, {params.lng.toFixed(6)}（来源：{params.src}）
        </div>
      </header>

      {/* 地图占位：明天接入 MapLibre */}
      <section className="h-[320px] rounded border grid place-items-center text-gray-500">
        Map placeholder
        <EVMap center={{ lat: params.lat, lng: params.lng }} />
      </section>

      {/* 三个信息卡：今天先占位，先做 EV 的接口明天接 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <div className="font-semibold mb-1">EV 充电桩（即将接入）
            <NearbyEV lat={params.lat} lng={params.lng} src={params.src} distance_km={params.distance_km} />
          </div>
          <div className="text-sm text-gray-600">将基于当前位置调用后端 /api/ev/nearby</div>
        </div>
        <div className="border rounded p-4">
          <div className="font-semibold mb-1">附近公交（即将接入）</div>
          <div className="text-sm text-gray-600">Adelaide Metro GTFS-Realtime</div>
        </div>
        <div className="border rounded p-4">
          <div className="font-semibold mb-1">开发申请（即将接入）</div>
          <div className="text-sm text-gray-600">PlanningAlerts（按半径筛选）</div>
        </div>
      </div>
    </main>
  );
}
