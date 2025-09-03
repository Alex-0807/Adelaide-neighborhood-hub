import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
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
app.get('/api/ev/nearby', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const distance_km = Number(req.query.distance_km ?? 2);
    const max = Number(req.query.max ?? 14);

    const valid =
      Number.isFinite(lat) && Number.isFinite(lng) &&
      lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    if (!valid) return res.status(400).json({ error: 'Invalid lat/lng' });

    // 用 URL 构造器拼查询参数，避免手拼字符串出错
    const url = new URL('https://api.openchargemap.io/v3/poi');
    url.searchParams.set('output', 'json');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set('distance', String(distance_km));
    url.searchParams.set('distanceunit', 'KM');
    url.searchParams.set('maxresults', String(max));

    // 说明：OCM 不强制要求 key，后续你申请了可以加在 header 里
    const resp = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.OCM_API_KEY ?? ''// X-API-Key is optional, only this website reqiuires it
      }
    });
//
    if (!resp.ok) {
      // 外部服务非 2xx，返回 502 表示“上游服务错误”
      const text = await resp.text();
      return res.status(502).json({ error: 'OpenChargeMap error', detail: text });
      //res defined the return value of the api, this is not interact with the third party api/website.
      // status 502 means the third party api/website has some problem.
    }

    const raw = await resp.json(); // 原始数组（字段很多）
    // 精简映射：只留下前端需要的关键字段
    const items = (Array.isArray(raw) ? raw : []).map((r: any) => {
      const p = r.AddressInfo ?? {};
      const conn = Array.isArray(r.Connections) && r.Connections.length ? r.Connections[0] : null;
      return {
        id: r.ID,                                        // 站点 ID
        title: p.Title ?? 'Unknown',                     // 站点名
        lat: p.Latitude,
        lng: p.Longitude,
        address: [p.AddressLine1, p.Town].filter(Boolean).join(', '),
        distanceKm: p.Distance,                          // 由 OCM 估算的距离
        status: r.StatusType?.IsOperational === false ? 'down' : 'up',
        powerKW: conn?.PowerKW ?? null,                  // 功率（第一条连接）
        connectionType: conn?.ConnectionType?.Title ?? null, // 接口类型
      };
    });

    res.json({ center: { lat, lng }, count: items.length, items, query: { distance_km, max } });
  } catch (e: any) {
    // 兜底异常（比如网络崩了/JSON 解析失败等）
    res.status(500).json({ error: 'server_error', detail: e?.message ?? String(e) });
  }
});



const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
