"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/Navibar";
import { useAuth } from "../../hooks/useAuth";

type Phase = "idle" | "locating";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [last, setLast] = useState<{ lat: number; lng: number } | null>(null);
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    // 1. Make a state variable to store the value

    // 2. Set it inside useEffect (runs only on client)
    const host = window.location.hostname;
    const secure =
      window.isSecureContext || host === "localhost" || host === "127.0.0.1";
    setIsSecure(secure);
    console.log("Is secure context?", secure);

    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("lastLocation"); //localstorage is a browser api, used to store data in the browser
      // data in localstorage will be kept forever until deleted by js or user.
      //in comparason, sessionstorage will be deleted when the tab is closed.
      // and cookies will be deleted according to the expire time.
      if (raw) {
        try {
          const v = JSON.parse(raw); //localstorage only supports string, so we need to parse it to object.
          if (typeof v?.lat === "number" && typeof v?.lng === "number")
            setLast(v);
          //if v is not null and v.lat is a number and v.lng is a number, then setLast(v)
        } catch {}
      }
    }
  }, []);

  const goDashboard = (
    lat: number,
    lng: number,
    source: "gps" | "manual" | "last"
  ) => {
    //source could only be 'gps', 'manual' or 'last'
    // lat.tofixed: keeps k decimal places
    const qs = `lat=${lat.toFixed(6)}&lng=${lng.toFixed(
      6
    )}&src=${source}&distance_km=${99}`; //generate query string
    router.push(`/dashboard?${qs}`); //navigate to dashboard page with query string
  };

  const locate = async () => {
    setError(null);
    if (!isSecure) {
      setError("need HTTPS or localhost, please input manually");
      return;
    }
    if (!("geolocation" in navigator)) {
      //navigator is a browser api, provides info about the browser
      setError(
        "Please input manually. Your browser does not support geolocation."
      ); //geolocation is a property of navigator, used to get the user's location
      return;
    }
    setPhase("locating");
    const options: PositionOptions = {
      //PositionOptions is a type defined in typescript for geolocation api
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      //the fixed structure of getCurrentPosition is getCurrentPosition(successCallback, errorCallback, options)
      //pos is to handle the successCallback
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords; //Fixed structure of pos. Coords includes latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed
        // 记住上次位置
        try {
          localStorage.setItem(
            "lastLocation",
            JSON.stringify({ lat: latitude, lng: longitude, accuracy })
          ); //localstorage only supports string, so we need to stringify the object.
        } catch {}
        goDashboard(latitude, longitude, "gps");
      },
      //err is to handle the errorCallback
      (err) => {
        if (err.code === err.PERMISSION_DENIED)
          setError(
            "permission denied. Please allow location access, or input manually."
          );
        else if (err.code === err.POSITION_UNAVAILABLE)
          setError("permission unavailable, please input manually.");
        else if (err.code === err.TIMEOUT)
          setError("timeout, please try again or input manually.");
        else setError("unknown error, please input manually.");
        setPhase("idle");
      },
      options
    );
  };

  const manualValid = useMemo(() => {
    const lat = Number(latInput);
    const lng = Number(lngInput);
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }, [latInput, lngInput]);

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-2xl lg:max-w-3xl mx-auto space-y-4 ">
      {/* <NavBar /> */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
        Adelaide Neighbourhood Hub
      </h1>
      <p className="text-sm text-gray-600">
        click the button to use your location, or input latitude and longitude
        manually.
      </p>

      <div className="space-y-2">
        <button
          onClick={locate}
          disabled={phase === "locating"}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {phase === "locating" ? "locating" : "Use my location"}
        </button>
        {!isSecure && (
          <div className="text-amber-600 text-sm">
            Not a secure context (need HTTPS or localhost)，please input
            manually.
          </div>
        )}
        {last && (
          <button
            onClick={() => goDashboard(last.lat, last.lng, "last")}
            className="block mt-1 px-3 py-1 text-sm rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            use the last location（{last.lat.toFixed(4)}, {last.lng.toFixed(4)})
          </button>
        )}
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="border rounded p-4 space-y-2">
        <div className="font-medium">Input manually</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            className="w-full border rounded p-2"
            placeholder="Latitude，such as -34.9285"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
          />
          <input
            className="w-full border rounded p-2"
            placeholder="Longitude，such as 138.6007"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
          />
        </div>
        <button
          onClick={() =>
            manualValid &&
            goDashboard(Number(latInput), Number(lngInput), "manual")
          }
          disabled={!manualValid}
          className="px-3 py-2 rounded bg-gray-900 text-white disabled:opacity-50"
        >
          Go
        </button>
        {!manualValid && (
          <div className="text-sm text-gray-600">
            range：lng -90~90，lag -180~180
          </div>
        )}
      </div>
    </main>
  );
}
