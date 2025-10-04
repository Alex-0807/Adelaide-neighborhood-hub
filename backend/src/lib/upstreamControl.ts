
export type CacheEntry<T = any> = { expire: number; data: T };

// 短缓存（内存 Map）
export const cache = new Map<string, CacheEntry>();

// 
export const inflight = new Map<string, Promise<any>>();// Map is like a dictionary

// 只统计 “真正打上游” 的额度
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
  let b = budgetByIp.get(ip);// type of b is Budget | undefined
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

// 归一化 & 生成 EV 缓存 key（≈100m 精度）
// export function makeEvKey(lat: number, lng: number, distance_km: number, max: number) {
//   const latQ = Number(lat.toFixed(3));
//   const lngQ = Number(lng.toFixed(3));
//   return `${latQ},${lngQ},${distance_km},${max}`;
// }

// // 只有存在 API key 才设置请求头
// export function ocmHeaders() {
//   const h: Record<string, string> = { 'Content-Type': 'application/json' };//Record is similar to Map
//   if (process.env.OCM_API_KEY) h['X-API-Key'] = process.env.OCM_API_KEY!;
//   return h;
// }
