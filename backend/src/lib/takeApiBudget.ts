// rateLimiter.ts
const store = new Map<string, { count: number; resetTime: number }>();

export function takeApiBudget(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetTime < now) {
    store.set(ip, { count: 1, resetTime: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limit) {
    return { ok: false, retrySecs: Math.ceil((entry.resetTime - now) / 1000) };
  }

  entry.count++;
  store.set(ip, entry);
  return { ok: true };
}
