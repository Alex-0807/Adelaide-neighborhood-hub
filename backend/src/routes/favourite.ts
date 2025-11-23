import express from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middlewares/auth.js";

const router = express.Router();
const prisma = new PrismaClient(); // Initialize Prisma Client, read DATABASE_URL from .env

router.post("/", auth, async (req, res) => {
  try {
    const { id, title, address, lat, lng, postId } = req.body;
    console.log("Received favourite request:", {
      userId: req.user?.userId,
      postId,
      title,
    });

    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }
    const userId = req.user.userId;

    // Ensure postId is valid
    if (!postId) {
      console.error("Missing postId in request body");
      return res.status(400).json({ error: "postId is required" });
    }

    await prisma.chargingStation.upsert({
      where: { id: postId },
      update: {
        title: title || "Unknown",
        address: address || null,
        lat: lat || 0,
        lng: lng || 0,
      },
      create: {
        id: postId,
        title: title || "Unknown",
        address: address || null,
        lat: lat || 0,
        lng: lng || 0,
      },
    });

    try {
      await prisma.favourite.create({
        data: {
          user: { connect: { id: userId } },
          post: { connect: { id: postId } },
        },
      });
    } catch (dbError: any) {
      // P2002 is Prisma's unique constraint violation error code
      if (dbError.code === "P2002") {
        return res.status(400).json({ error: "Favourite already exists" });
      }
      throw dbError; // Re-throw other errors to be caught by the outer catch
    }

    res.json({ message: "Favourite of Charging Station added" });
  } catch (error: any) {
    console.error("Error in favourite route:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});
router.get("/", auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }
    const userId = req.user.userId;
    const favourites = await prisma.favourite.findMany({
      where: { userId },
      include: {
        post: true,
      },
    });
    const formatted = favourites.map((fav) => ({
      id: fav.id,
      title: fav.post.title,
      address: fav.post.address,
      lat: fav.post.lat,
      lng: fav.post.lng,
      postId: fav.post.id,
    }));

    res.json({ items: formatted });
  } catch (error: any) {
    console.error("Error fetching favourites:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
