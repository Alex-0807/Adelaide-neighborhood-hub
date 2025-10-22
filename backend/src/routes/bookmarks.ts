import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient(); // Initialize Prisma Client, read DATABASE_URL from .env

router.get("/", async (req, res) => {
  const bookmarks = await prisma.bookmark.findMany();
  res.json(bookmarks);
});

router.post("/", async (req, res) => {
  const { userId, title, address, lat, lng } = req.body;
  const newBookmark = await prisma.bookmark.create({
    data: { userId, title, address, lat, lng },
  });
  res.json(newBookmark);
});

export default router;
