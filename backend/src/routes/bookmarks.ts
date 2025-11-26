import express from "express";
import prisma from "../prisma.js";

const router = express.Router();
// prisma is imported from shared instance

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
