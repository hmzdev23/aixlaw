/**
 * In-process TTL cache. Hackathon-grade — survives a single Next.js dev/serverless
 * worker instance. Replace with Redis/KV in production.
 */

interface Entry<V> {
  value: V;
  expiresAt: number;
}

export class TtlCache<K, V> {
  private readonly ttlMs: number;
  private readonly store = new Map<K, Entry<V>>();

  constructor(ttlMs = 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  get(key: K): V | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.ttlMs),
    });
  }

  delete(key: K): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}
