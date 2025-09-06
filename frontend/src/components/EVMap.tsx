'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

type EVMapProps = { center: { lat: number; lng: number } };

export default function EVMap({ center }: EVMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      // ⚠️ 直接内联 OSM 栅格样式，绕过远程 style.json
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
      map.resize(); // calculate the size of the map
      new maplibregl.Marker({ color: 'blue' })// create a blue marker
        .setLngLat([center.lng, center.lat])  // set the position of the marker
        .setPopup(new maplibregl.Popup().setText('Your position'))// add popup to the marker when clicking
        .addTo(map);
    });
      new maplibregl.Marker({ color: 'green' }) // 可用的桩

    // 一些调试日志（如果还有问题，看看控制台）
    map.on('style.load', () => console.log('Map style loaded'));
    map.on('error', (e) => console.error('Map error:', e?.error || e));

    return () => map.remove();
  }, [center.lat, center.lng]);

  return <div ref={mapContainer} className="w-full h-full rounded" />;
}
