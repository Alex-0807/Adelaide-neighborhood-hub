import express from "express";
import { getNearbyVehicles } from "../../services/GTFS-Rt.js";

export const TransitRouter = express.Router();
TransitRouter.get("/vehicle-positions", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    console.log(
      `Vehicle positions requested${lat && lng ? ` for location (${lat}, ${lng})` : ""}`,
    );
    const result =
      lat && lng
        ? await getNearbyVehicles(Number(lat), Number(lng), 2)
        : await getNearbyVehicles(-34.9261, 138.5999, 500); // if no location provided, return all vehicles within 500km
    res.json(result);
  } catch (error) {
    console.error("Error fetching vehicle positions:", error);
    res.status(500).json({ error: "Failed to fetch vehicle positions" });
  }
});
