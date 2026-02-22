"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createRoot } from "react-dom/client";
import TransitPopup from "@/components/map/popups/TransitPopup";
import { mountReactPopup } from "@/utils/maplibre";
import { useAuth } from "@/hooks/useAuth";
import { EVMapProps, MarkerEntry } from "./types";
import { goDirection } from "./utils";
import EVPopup from "./EVPopup";

export default function EVMap({
  center,
  items,
  selectedId,
  onSelect,
  stops,
  vehicles,
}: EVMapProps) {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null); // could use it to control the div element by ref
  const mapRef = useRef<maplibregl.Map | null>(null); // store the map instance
  const markersRef = useRef<MarkerEntry[]>([]); // array to store the markers, useless for now, probable useful in the future
  const transitMarkersRef = useRef<
    {
      id: string;
      marker: maplibregl.Marker;
      popup: maplibregl.Popup;
      destroy?: () => void;
    }[]
  >([]);

  const vehicleMarkersRef = useRef<
    {
      id: string;
      marker: maplibregl.Marker;
      popup: maplibregl.Popup;
    }[]
  >([]);

  // console.log('items',items);
  // console.log("stops", stops);

  // console.log("selected id:", selectedId);
  // const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  // initialize the map only once
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    // make sure map is created in the next frame, so that the container div is fully ready
    const raf = requestAnimationFrame(() => {
      const map = new maplibregl.Map({
        container: mapContainer.current!, // ! means mapContainer.current is not null
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [center.lng, center.lat],
        zoom: 14,
      });

      mapRef.current = map;

      map.on("load", () => {
        map.resize(); // make sure the map is properly sized
        new maplibregl.Marker({ color: "blue" })
          .setLngLat([center.lng, center.lat])
          .setPopup(new maplibregl.Popup().setText("Your position"))
          .addTo(map);
      });

      map.on("style.load", () => console.log("Map style loaded"));
      map.on("error", (e) => console.error("Map error:", e?.error || e));
    });

    // resize observer to make sure the map resizes with the container
    let ro: ResizeObserver | null = null;
    if (mapContainer.current) {
      ro = new ResizeObserver(() => mapRef.current?.resize());
      ro.observe(mapContainer.current);
    }
    //return only happens when the component unmounts, so it's a good place to do cleanup
    return () => {
      cancelAnimationFrame(raf); // cancel the map creation if the component unmounts before it finishes
      ro?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapRef.current) return;
    console.log("Updating markers for items:", items);

    // remove old markers
    markersRef.current.forEach((m) => m.marker.remove());
    markersRef.current = [];

    // add new markers
    items.forEach((item) => {
      // console.log("Adding marker for item:", item);

      const node = document.createElement("div");
      createRoot(node).render(
        <EVPopup
          item={item}
          goDirection={() => goDirection(item.lat, item.lng)}
          user={user}
        />,
      );
      const popup = new maplibregl.Popup({ closeOnClick: false }).setDOMContent(
        node,
      );

      const marker = new maplibregl.Marker({
        color: item.status === "up" ? "green" : "red",
      })
        .setLngLat([item.lng, item.lat])
        // .setPopup(new maplibregl.Popup().setDOMContent(node))
        .addTo(mapRef.current!);

      marker.getElement().addEventListener("click", () => {
        onSelect(item.id); // when marker clicked, call onSelect with the item's id
      });
      markersRef.current.push({ id: item.id, marker, popup });

      // if its selected, popup
      // if (item.id === selectedId) {
      //   console.log("popup for selected item:", item.id);

      //   marker.togglePopup();
      // }
    });
  }, [items, onSelect, user]);

  useEffect(() => {
    if (!mapRef.current || !vehicles) return;

    // Clear old vehicle markers
    vehicleMarkersRef.current.forEach((m) => m.marker.remove());
    vehicleMarkersRef.current = [];

    vehicles.forEach((vehicle: any) => {
      // Create a simple popup content
      const popupContent = `
        <div class="p-2">
          <div class="font-bold">Bus ${vehicle.label || vehicle.vehicleId}</div>
          <div class="text-sm">Route: ${vehicle.routeId}</div>
          <div class="text-xs text-gray-500">Speed: ${Math.round((vehicle.speed || 0) * 3.6)} km/h</div> 
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

      // Create a custom DOM element for the marker (Bus Icon)
      const el = document.createElement("div");
      el.className = "bus-marker";
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#7c3aed" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 10h16v6a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-6Z"/>
          <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
          <path d="M2 10h20"/>
          <circle cx="7" cy="14" r="1.5" fill="white"/>
          <circle cx="17" cy="14" r="1.5" fill="white"/>
        </svg>
      `;

      // Create vehicle marker with the custom element
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([vehicle.lon, vehicle.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      vehicleMarkersRef.current.push({
        id: vehicle.vehicleId,
        marker,
        popup,
      });
    });
  }, [vehicles]);

  //when selectedId changes, open the popup for the selected marker and close others
  useEffect(() => {
    console.log("Selected ID changed:", selectedId);

    if (selectedId == null || !mapRef.current) return;

    markersRef.current.forEach(({ id, marker, popup }) => {
      if (id === selectedId) {
        // open popup
        popup.setLngLat(marker.getLngLat()).addTo(mapRef.current!);
        mapRef.current?.flyTo({ center: marker.getLngLat(), zoom: 15 });
      } else {
        //remove popup
        popup.remove();
      }
    });
  }, [selectedId]);

  // when center changes, fly to the new center
  useEffect(() => {
    mapRef.current?.flyTo({ center: [center.lng, center.lat], zoom: 14 });
  }, [center.lat, center.lng]);
  // console.log(items);

  return (
    <div ref={mapContainer} className="w-full h-full min-h-[320px] rounded" />
  );
}
