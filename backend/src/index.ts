import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:3000" }));

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


const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
