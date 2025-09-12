//no need 'use client' here, because this component is used in a client component
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
  selectedId?: number;
  onSelect: (id: number) => void;
};
type EVPropstest = {
  lat: number;
  lng: number;
  src: string | null;
  distance_km?: number;
};
console.log("NearbyEV component loaded!");

export default function NearbyEV({ items, selectedId, onSelect}: EVProps) {
// console.log("NearbyEV component loaded!");

  return (
    <ul>
      {items.map(s => (
         <li
          key={s.id}
          className={`mb-2 p-3 rounded-lg border cursor-pointer transition 
            ${s.id === selectedId 
              ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold shadow-md" 
              : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
            }`}
            onClick={() => {onSelect(s.id)}}
        >
          <div className="text-sm font-medium">{s.title}</div>
          <div className="text-xs text-gray-500">{s.address}</div>
        </li>
      ))}
    {/* <div className="bg-red-500 text-white p-4">test</div> */}

    </ul>
  );
}
