import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { z } from "zod";
import { takeApiBudget } from "./lib/takeApiBudget.js";
import { cache, inflight, takeUpstreamBudget } from "./lib/upstreamControl.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import authRoutes from "./routes/auth.js";
import favouriteRoutes from "./routes/favourite.js";
import prisma from "./prisma.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:3000",
    credentials: true, // allow browsers to include cookies
  })
);
app.use(cookieParser()); // parse incoming cookies (token reading later)
//cors: only allow specific server to access

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/db-check", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", message: "Database connection successful" });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Database connection failed",
        error: error.message,
      });
  }
});
app.get("/api/transit/nearby", (req, res) => {
  //fake data for demo
  res.json({
    center: { lat: -34.9285, lng: 138.6007 },
    stops: [
      {
        stopId: "13766",
        name: "King William St / Gouger St",
        lat: -34.9298,
        lng: 138.5999,
        distanceM: 210,
        departures: [
          {
            routeShort: "J1",
            headsign: "Glenelg",
            etaMin: 3,
            tripId: "J1_demo_0812",
            vehicleId: "V_421",
            routeColor: "#1279FF",
          },
          {
            routeShort: "98C",
            headsign: "City Loop",
            etaMin: 7,
            tripId: "98C_demo_0817",
            vehicleId: null,
            routeColor: "#00AA55",
          },
        ],
      },
      {
        stopId: "14005",
        name: "Victoria Square East",
        lat: -34.9275,
        lng: 138.6023,
        distanceM: 380,
        departures: [
          {
            routeShort: "T2",
            headsign: "Marion Centre",
            etaMin: 5,
            tripId: "T2_demo_0815",
            vehicleId: "V_512",
            routeColor: "#FF6B00",
          },
        ],
      },
      {
        stopId: "13501",
        name: "Pulteney St / Rundle Mall",
        lat: -34.9229,
        lng: 138.6048,
        distanceM: 660,
        departures: [],
      },
    ],
    meta: {
      realtime: false,
      lastTripUpdatesAt: null,
      fetchedAt: 1739400000000,
    },
  });
});

const NearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  distance_km: z.coerce.number().positive().max(99).default(2),
  max: z.coerce.number().int().positive().max(50).default(14),
});
app.get("/api/ev/nearby", async (req, res) => {
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
    const url = new URL("https://api.openchargemap.io/v3/poi");
    url.searchParams.set("output", "json");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set("distance", String(distance_km));
    url.searchParams.set("distanceunit", "KM");
    url.searchParams.set("maxresults", String(max));

    const key = `${lat.toFixed(3)},${lng.toFixed(3)},${distance_km},${max}`; //cache key
    const cached = cache.get(key);
    if (cached && cached.expire > Date.now()) {
      console.log("✅ Cache hit:", key);
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
        return res
          .status(502)
          .json({ error: "upstream_error", detail: String(err) });
      }
    }

    console.log("⏳ Cache miss, fetching OCM API:", key); //if cache miss, fetch the third party api/website.

    //going to fetch the api, so deduct the budget first.
    const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0] ??
      req.ip ??
      "unknown") as string;
    const token = takeUpstreamBudget(ip);
    if (!token.ok) {
      res.setHeader(
        "Retry-After",
        Math.ceil((token.reset - Date.now()) / 1000)
      );
      if (cached) return res.json(cached.data);
      return res.status(429).json({
        error: "too_many_requests",
        message: "Upstream budget exceeded.",
      });
    }

    /////////////
    const resp = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.OCM_API_KEY ?? "", // X-API-Key is optional, only this website reqiuires it
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res
        .status(502)
        .json({ error: "OpenChargeMap error", detail: text });
      //res defined the return value of the api, this is not interact with the third party api/website.
      // status 502 means the third party api/website has some problem.
    }

    const raw = await resp.json(); // original data
    const items = (Array.isArray(raw) ? raw : []).map((r: any) => {
      const p = r.AddressInfo ?? {};
      const conn =
        Array.isArray(r.Connections) && r.Connections.length
          ? r.Connections[0]
          : null;
      return {
        id: r.ID, //  ID
        title: p.Title ?? "Unknown", // Name
        lat: p.Latitude,
        lng: p.Longitude,
        address: [p.AddressLine1, p.Town].filter(Boolean).join(", "),
        distanceKm: p.Distance, //Estimated distance
        status: r.StatusType?.IsOperational === false ? "down" : "up",
        powerKW: conn?.PowerKW ?? null,
        connectionType: conn?.ConnectionType?.Title ?? null,
      };
    });
    const data = {
      center: { lat, lng },
      count: items.length,
      items,
      query: { distance_km, max },
    };
    cache.set(key, { expire: Date.now() + 1 * 60 * 1000, data });
    console.log("cache write", cached, cache.get(key));

    res.json({
      center: { lat, lng },
      count: items.length,
      items,
      query: { distance_km, max },
    });
  } catch (e: any) {
    // backup
    res
      .status(500)
      .json({ error: "server_error", detail: e?.message ?? String(e) });
  }
});
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/auth", authRoutes);
app.use("/favourite", favouriteRoutes);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
