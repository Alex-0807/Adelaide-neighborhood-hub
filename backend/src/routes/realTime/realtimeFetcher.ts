import express from "express";
import { getVehiclePositions } from "../../services/GTFS-Rt.js";

export const TransitRouter = express.Router();
TransitRouter.get("/vehicle-positions", async (req, res) => {
  try {
    const result = await getVehiclePositions();
    res.json(result);
  } catch (error) {
    console.error("Error fetching vehicle positions:", error);
    res.status(500).json({ error: "Failed to fetch vehicle positions" });
  }
});
