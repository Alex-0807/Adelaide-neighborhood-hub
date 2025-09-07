'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type EVMapProps = { center: { lat: number; lng: number } };

export default function EVMap({ center }: EVMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);// could use it to control the div element by ref
  const mapRef = useRef<maplibregl.Map | null>(null);// store the map instance

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

  // 当 center 变化时，飞过去（而不是重建地图）
  useEffect(() => {
    mapRef.current?.flyTo({ center: [center.lng, center.lat], zoom: 14 });
  }, [center.lat, center.lng]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[320px] rounded"
    />
  );
}
