import React from "react";

export type TransitDeparture = {
  routeShort: string;
  headsign: string | null;
  etaMin: number;
  routeColor?: string;
};

export type TransitStopItem = {
  stopId: string;
  name: string;
  lat: number;
  lng: number;
  distanceM: number;
  departures: TransitDeparture[];
};

export default function TransitPopup({
  stop,
  onDirection,
}: {
  stop: TransitStopItem;
  onDirection: () => void;
}) {
  return (
    <div className="text-sm">
      <div className="font-semibold">{stop.name}</div>
      <div className="text-xs opacity-70">
        {(stop.distanceM / 1000).toFixed(2)} km
      </div>
      <ul className="mt-1 space-y-0.5">
        {stop.departures.slice(0, 3).map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="inline-block w-8 text-center rounded px-1"
              style={{ background: d.routeColor ?? "#eee" }}
            >
              {d.routeShort}
            </span>
            <span>{d.headsign ?? ""}</span>
            <span className="ml-auto tabular-nums">{d.etaMin} min</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onDirection}
        className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
      >
        Directions
      </button>
    </div>
  );
}
