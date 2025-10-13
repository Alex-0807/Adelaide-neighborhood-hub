export type CacheEntry<T = any> = { expire: number; data: T };

// A simple in-memory cache
export const cache = new Map<string, CacheEntry>();

//
export const inflight = new Map<string, Promise<any>>(); // Map is like a dictionary

//
export const MISS_LIMIT = 3;
export const MISS_WINDOW_MS = 60_000;

type Budget = { count: number; reset: number };
const budgetByIp = new Map<string, Budget>();

export function takeUpstreamBudget(
  ip: string,
  limit = MISS_LIMIT,
  windowMs = MISS_WINDOW_MS
) {
  const now = Date.now();
  let b = budgetByIp.get(ip); // type of b is Budget | undefined
  if (!b || b.reset <= now) {
    b = { count: 0, reset: now + windowMs };
    budgetByIp.set(ip, b);
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, reset: b.reset };
  }
  b.count += 1;
  return { ok: true, remaining: limit - b.count, reset: b.reset };
}
