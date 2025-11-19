import type { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload & { userId?: number };
    // if only userId is stored, use:
    // user?: { userId: number };
  }
}
