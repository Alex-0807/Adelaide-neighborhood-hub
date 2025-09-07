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
};
type EVPropstest = {
  lat: number;
  lng: number;
  src: string | null;
  distance_km?: number;
};
export default function NearbyEV({ items }: EVProps) {
  // const [stations, setStations] = useState<any[]>([]);
  // const [query, setQuery] = useState<{distance_km:number; max:number}>({distance_km:404,max:11});

  // useEffect(() => {
  //   const loadStations = async () => {
  //     // console.log(distance_km);
      
  //     try {
  //       const resp = await fetch(`http://localhost:3001/api/ev/nearby?lat=${lat}&lng=${lng}&distance_km=${distance_km}&max=10`);
  //       const data = await resp.json();
  //       setStations(data.items);
  //       setQuery(data.query);
  //     } catch (err) {
  //       console.error("API error:", err);
  //     }
  //   };

  //   loadStations(); // 调用异步函数
  // }, []);

  return (
    <ul>
      {items.map(s => (
        <li key={s.id}>{s.title} — {s.address}</li>
      ))}
      {/* <li key={'query'}>distance_km: {query.distance_km}</li> */}
      {/* <li>test</li> */}
    </ul>
  );
}
