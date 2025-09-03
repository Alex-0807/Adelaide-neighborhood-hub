'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

type EVMapProps = {
  center: { lat: number; lng: number };
};

export default function EVMap({ center }: EVMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return; // 避免重复初始化
    if (!mapContainer.current) return;

    // 初始化地图
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // 免费 demo 样式
      center: [center.lng, center.lat],
      zoom: 14,
    });

    mapRef.current = map;

    // 在中心点放一个 Marker
    new maplibregl.Marker({ color: 'blue' })
      .setLngLat([center.lng, center.lat])
      .setPopup(new maplibregl.Popup().setText('你的位置'))
      .addTo(map);

    return () => {
      map.remove();
    };
  }, [center]);

  return (
    <div> <div
      ref={mapContainer}
      style={{ width: '100%', height: '400px', borderRadius: '8px'}}
    />
    test</div>
   
  );
}
