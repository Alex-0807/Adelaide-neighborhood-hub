type CacheEntry<T> = { value: T; expiresAt: number };

export class TTLCache<T> {
  private entry: CacheEntry<T> | null = null;

  constructor(private ttlMs: number) {}

  get(): T | null {
    if (!this.entry) return null;
    if (Date.now() > this.entry.expiresAt) {
      this.entry = null;
      return null;
    }
    return this.entry.value;
  }

  set(value: T) {
    this.entry = { value, expiresAt: Date.now() + this.ttlMs };
  }

  clear() {
    this.entry = null;
  }
}
