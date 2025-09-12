'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Phase = 'idle' | 'locating';

export default function Home() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [last, setLast] = useState<{ lat: number; lng: number } | null>(null);

  // 仅在浏览器端判断「是否安全环境」
const isSecure = useMemo(() => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return window.isSecureContext || host === 'localhost' || host === '127.0.0.1';
}, []);


  
  
  useEffect(() => {
    // 读取上次成功定位（可选）
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('lastLocation');//localstorage is a browser api, used to store data in the browser
                                                       // data in localstorage will be kept forever until deleted by js or user.
                                                       //in comparason, sessionstorage will be deleted when the tab is closed.
                                                       // and cookies will be deleted according to the expire time.
      if (raw) {                                                
        try {
          const v = JSON.parse(raw);    //localstorage only supports string, so we need to parse it to object.               
          if (typeof v?.lat === 'number' && typeof v?.lng === 'number') setLast(v);
          //if v is not null and v.lat is a number and v.lng is a number, then setLast(v)
        } catch {}
      }
    }
  }, []);

  const goDashboard = (lat: number, lng: number, source: 'gps' | 'manual' | 'last') => {
    //source could only be 'gps', 'manual' or 'last'
    // lat.tofixed: 保留 6 位小数
    const qs = `lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}&src=${source}&distance_km=${99}`; //generate query string
    router.push(`/dashboard?${qs}`);//navigate to dashboard page with query string
  };

  const locate = async () => {
    setError(null);
    if (!isSecure) {
      setError('need HTTPS or localhost, please input manually');
      return;
    }
    if (!('geolocation' in navigator)) {//navigator is a browser api, provides info about the browser
      setError('当前浏览器不支持定位，请改用手动输入。');
      return;
    }
    setPhase('locating');
    const options: PositionOptions = {//PositionOptions is a type defined in typescript for geolocation api
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      //the fixed structure of getCurrentPosition is getCurrentPosition(successCallback, errorCallback, options)
      //pos is to handle the successCallback
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;//Fixed structure of pos. Coords includes latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed
        // 记住上次位置
        try {
          localStorage.setItem('lastLocation', JSON.stringify({ lat: latitude, lng: longitude, accuracy }));//localstorage only supports string, so we need to stringify the object.
        } catch {}
        goDashboard(latitude, longitude, 'gps');
      },
      //err is to handle the errorCallback
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setError('已拒绝定位权限。你可以在浏览器设置里开启，或改用手动输入。');
        else if (err.code === err.POSITION_UNAVAILABLE) setError('定位信息不可用（室内/信号弱）。请靠近窗户，或改用手动输入。');
        else if (err.code === err.TIMEOUT) setError('定位超时，请重试或改用手动输入。');
        else setError('定位失败，请改用手动输入。');
        setPhase('idle');
      },
      options
    );
  };

  const manualValid = useMemo(() => {
    const lat = Number(latInput);
    const lng = Number(lngInput);
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }, [latInput, lngInput]);

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Adelaide Neighbourhood Hub</h1>
      <p className="text-sm text-gray-600">
        click the button to use your location, or input latitude and longitude manually.
      </p>

      <div className="space-y-2">
        <button
          onClick={locate}
          disabled={phase === 'locating'}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {phase === 'locating' ? '定位中…' : 'Use my location'}
        </button>
        {!isSecure && (
          <div className="text-amber-600 text-sm">
            当前非安全环境（需要 HTTPS 或 localhost），定位按钮将不可用。
          </div>
        )}
        {last && (
          <button
            onClick={() => goDashboard(last.lat, last.lng, 'last')}
            className="block text-left underline text-sm"
          >
            use the last location（{last.lat.toFixed(4)}, {last.lng.toFixed(4)})
          </button>
        )}
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="border rounded p-4 space-y-2">
        <div className="font-medium">input manually</div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            placeholder="Latitude，such as -34.9285"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
          />
          <input
            className="flex-1 border rounded p-2"
            placeholder="Longitude，such as 138.6007"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
          />
        </div>
        <button
          onClick={() => manualValid && goDashboard(Number(latInput), Number(lngInput), 'manual')}
          disabled={!manualValid}
          className="px-3 py-2 rounded bg-gray-900 text-white disabled:opacity-50"
        >
          Go
        </button>
        {!manualValid && <div className="text-sm text-gray-600">range：lng -90~90，lag -180~180</div>}
      </div>
    </main>
  );
}
