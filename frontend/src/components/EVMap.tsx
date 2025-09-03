import { useEffect, useState } from "react";

type EVProps = {
  lat: number;
  lng: number;
  src: string | null;
};
export default function NearbyEV({ lat, lng, src }: EVProps) {
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const resp = await fetch(`http://localhost:3001/api/ev/nearby?lat=${lat}&lng=${lng}&distance_km=99&max=10`);
        const data = await resp.json();
        setStations(data.items);
      } catch (err) {
        console.error("API error:", err);
      }
    };

    loadStations(); // 调用异步函数
  }, []);

  return (
    <ul>
      {stations.map(s => (
        <li key={s.id}>{s.title} — {s.address}</li>
      ))}
    </ul>
  );
}
