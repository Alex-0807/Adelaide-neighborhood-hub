'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
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

type MapProps = { 
  center: { lat: number; lng: number }, 
  items: Item[],
  selectedId?: number;
  onSelect: (id: number) => void;};