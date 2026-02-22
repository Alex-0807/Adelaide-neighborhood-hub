type CacheEntry<T> = { value: T; expiresAt: number };

export class TTLCache<T> {
  private entry: CacheEntry<T> | null = null;

  constructor(private ttlMs: number) {}
  // Type T means the type of the value we want to cache, it can be any type, and we will specify it when we create an instance of TTLCache. For example, in GTFS-RT service, we use TTLCache<VehiclePositionsPayload> to cache the vehicle positions data.
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
