// import { Request, Response, NextFunction } from "express";

// const store = new Map<string, { count: number; resetTime: number }>();

// export function rateLimiter(limit: number, windowMs: number) {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const ip = req.ip || "unknown";
//     const now = Date.now();
//     const entry = store.get(ip);

//     if (!entry || entry.resetTime < now) {
//       store.set(ip, { count: 1, resetTime: now + windowMs });
//       return next();
//     }

//     if (entry.count >= limit) {
//       const retrySecs = Math.ceil((entry.resetTime - now) / 1000);
//       res.setHeader("Retry-After", retrySecs);
//       return res.status(429).json({
//         error: "too_many_requests",
//         message: `Rate limit exceeded. Try again in ${retrySecs} seconds.`,
//       });
//     }

//     entry.count++;
//     store.set(ip, entry);
//     next();
//   };
// }
