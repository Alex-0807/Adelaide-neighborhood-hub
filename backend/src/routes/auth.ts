import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import jwt from "jsonwebtoken";
import { auth } from "../middlewares/auth.js";
const router = express.Router();
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  res
    .status(201)
    .json({ message: "User registered successfully.", userId: newUser.id });
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(400).json({ error: "Wrong password" });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ message: "Login successful", token });
});
router.get("/me", auth, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authorized" });
  } // without this if check, TS will complain that req.user may be undefined
  res.json({ userId: req.user.userId });
});
router.post("/logout", (req, res) => {
  // clear cookie
  res.clearCookie("token");

  res.json({ message: "Logged out" });
});
export default router;
