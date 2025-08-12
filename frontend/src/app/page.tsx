"use client";
import { useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  const testFetch = async () => {
    setErr("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transit/nearby`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e:any) {
      setErr(e?.message ?? "fetch failed");
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Adelaide Neighbourhood Hub</h1>
      <button
        onClick={testFetch}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        测试请求后端
      </button>

      {err && <p className="text-red-600">Error: {err}</p>}
      {data && (
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
{JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}