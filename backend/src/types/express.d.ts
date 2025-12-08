import type { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  // this augments the existing Request interface, without this, req.user will show errors
  interface Request {
    user?: JwtPayload & { userId?: number };
    // if only userId is stored, use:
    // user?: { userId: number };
  }
}
