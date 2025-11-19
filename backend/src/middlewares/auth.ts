import jwt from "jsonwebtoken";

export function auth(req: any, res: any, next: any) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // userId is in decoded
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
