export type Item = {
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

export type Stop = {
  stopId: string;
  name: string;
  lat: number;
  lng: number;
  distanceM: number;
  departures: Departure[];
};

export type MarkerEntry = {
  id: number;
  marker: maplibregl.Marker;
  popup: maplibregl.Popup;
};

export type EVMapProps = {
  center: { lat: number; lng: number };
  items: Item[];
  selectedId?: number;
  onSelect: (id: number) => void;
  stops?: Stop[];
  vehicles?: any[]; // the type of vehicle is not defined yet, it depends on the backend response
};
