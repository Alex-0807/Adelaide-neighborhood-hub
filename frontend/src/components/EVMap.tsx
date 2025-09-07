'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { it } from 'node:test';
import { createRoot } from "react-dom/client";

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
}

type EVProps = {
  items: Item[];
};
type EVMapProps = { center: { lat: number; lng: number }, items: Item[] };

function goDirection(lat: number, lng: number) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank");}


function EVPopup({ item, goDirection }: { item: any; goDirection: () => void }) {
  return (
    <div>
      <div><strong>{item.title}</strong></div>
      <div>{item.distanceKm?.toFixed(2)} km away</div>
      <div>{item.address}</div>
      <div>Type: {item.connectionType || 'N/A'}</div>
      <div>Power: {item.powerKW ? item.powerKW + ' kW' : 'N/A'}</div>
      <button onClick={goDirection}
              className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
        Direction      
      </button>
    </div>
  );
}


export default function EVMap({ center, items }: EVMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);// could use it to control the div element by ref
  const mapRef = useRef<maplibregl.Map | null>(null);// store the map instance
  
  console.log('items',items);

  // 仅初始化一次
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    // 等下一帧，确保容器已布局（可选但稳妥）
    const raf = requestAnimationFrame(() => {
      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: [center.lng, center.lat],
        zoom: 14,
      });

      mapRef.current = map;

      map.on('load', () => {
        map.resize(); // 首次确保尺寸正确
        new maplibregl.Marker({ color: 'blue' })
          .setLngLat([center.lng, center.lat])
          .setPopup(new maplibregl.Popup().setText('Your position'))
          .addTo(map);
      });

      map.on('style.load', () => console.log('Map style loaded'));
      map.on('error', (e) => console.error('Map error:', e?.error || e));
    });

    // 监测容器尺寸变化，及时 resize
    let ro: ResizeObserver | null = null;
    if (mapContainer.current) {
      ro = new ResizeObserver(() => mapRef.current?.resize());
      ro.observe(mapContainer.current);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

useEffect(() => {
  if (!mapRef.current) return;

  items.forEach((item) => {
    const node = document.createElement("div");
    createRoot(node).render(
    <EVPopup item={item} goDirection={()=>goDirection(item.lat, item.lng)} />//use inline arrow function to pass parameter
      );
    new maplibregl.Marker({ color: item.status === "up" ? "green" : "red" })
      .setLngLat([item.lng, item.lat])
      .setPopup(
    new maplibregl.Popup().setDOMContent(node)
  )
      .addTo(mapRef.current!);
  });
}, [items]);

  // when center changes, fly to the new center
  useEffect(() => {
    mapRef.current?.flyTo({ center: [center.lng, center.lat], zoom: 14 });
  }, [center.lat, center.lng]);
// console.log(items);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[320px] rounded"
    />
  );
}
