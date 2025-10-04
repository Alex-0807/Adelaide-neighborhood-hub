import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { takeApiBudget } from "./lib/takeApiBudget.js";
import { cache, inflight, takeUpstreamBudget} from "./lib/upstreamControl.js";

dotenv.config();

const app = express();
// const cache = new Map<string, { expire: number; data: any }>();

app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:3000" }));
//cors: only allow specific server to access

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/transit/nearby", (req, res) => {
  // 先返回假数据，等会再换真实API
  res.json({
    center: { lat: -34.921, lng: 138.606 },
    stops: [
      { id: "stop-1", name: "Stop A", etaSec: 240 },
      { id: "stop-2", name: "Stop B", etaSec: 480 },
    ],
  });
});
// 1) 骨架版：先只校验参数，返回假数据，确认路由没问题
// 2) 真实版：向 Open Charge Map 发请求 → 精简结果 → 返回给前端

const NearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  distance_km: z.coerce.number().positive().max(99).default(2),
  max: z.coerce.number().int().positive().max(50).default(14),
});
app.get('/api/ev/nearby', async (req, res) => {
  // console.log('api called',req.query.lat,req.query.lng);
  
  const parsed = NearbySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "bad_request",
      detail: parsed.error.flatten(),
    });
  }
  const { lat, lng, distance_km, max } = parsed.data;
  try {


    const url = new URL('https://api.openchargemap.io/v3/poi');
    url.searchParams.set('output', 'json');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set('distance', String(distance_km));
    url.searchParams.set('distanceunit', 'KM');
    url.searchParams.set('maxresults', String(max));

    const key = `${lat.toFixed(3)},${lng.toFixed(3)},${distance_km},${max}`;//cache key
    const cached = cache.get(key);
    if (cached && cached.expire > Date.now()) {
      console.log('✅ Cache hit:', key);
      return res.json(cached.data);
    }
    // check if there is already a request in flight
    if (inflight.has(key)) {
      console.log("⏳ Wait inflight:", key);
      try {
        const data = await inflight.get(key)!;
        return res.json(data);
      } catch (err) {
        if (cached) return res.json(cached.data);
        return res.status(502).json({ error: "upstream_error", detail: String(err) });
    }
  }    

    console.log('⏳ Cache miss, fetching OCM API:', key);//if cache miss, fetch the third party api/website.

    //going to fetch the api, so deduct the budget first.
    const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] ?? req.ip ?? 'unknown') as string;
    const token = takeUpstreamBudget(ip);
    if (!token.ok) {
      res.setHeader("Retry-After", Math.ceil((token.reset - Date.now()) / 1000));
      if (cached) return res.json(cached.data);
      return res.status(429).json({ error: "too_many_requests", message: "Upstream budget exceeded." });
    }


    
/////////////
    const resp = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.OCM_API_KEY ?? ''// X-API-Key is optional, only this website reqiuires it
      }
    });


    if (!resp.ok) {
      // 外部服务非 2xx，返回 502 表示“上游服务错误”
      const text = await resp.text();
      return res.status(502).json({ error: 'OpenChargeMap error', detail: text });
      //res defined the return value of the api, this is not interact with the third party api/website.
      // status 502 means the third party api/website has some problem.
    }

    const raw = await resp.json(); // original data 
    const items = (Array.isArray(raw) ? raw : []).map((r: any) => {
      const p = r.AddressInfo ?? {};
      const conn = Array.isArray(r.Connections) && r.Connections.length ? r.Connections[0] : null;
      return {
        id: r.ID,                                        //  ID
        title: p.Title ?? 'Unknown',                     // Name
        lat: p.Latitude,
        lng: p.Longitude,
        address: [p.AddressLine1, p.Town].filter(Boolean).join(', '),
        distanceKm: p.Distance,                          //Estimated distance
        status: r.StatusType?.IsOperational === false ? 'down' : 'up',
        powerKW: conn?.PowerKW ?? null,                  
        connectionType: conn?.ConnectionType?.Title ?? null, 
      };
    });
    const data = { center: { lat, lng }, count: items.length, items, query: { distance_km, max } };
    cache.set(key, { expire: Date.now() + 1 * 60 * 1000, data });
    console.log('cache write',cached,cache.get(key));
    
    res.json({ center: { lat, lng }, count: items.length, items, query: { distance_km, max } });
  } catch (e: any) {
    // backup
    res.status(500).json({ error: 'server_error', detail: e?.message ?? String(e) });
  }
});



const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
