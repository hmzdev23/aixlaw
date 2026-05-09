/**
 * Tiny `fetch` wrapper with timeout + JSON parsing. Used by CanLII and Cloud
 * Translation clients so we never hang the demo on a slow third-party call.
 */

export interface HttpJsonOptions extends RequestInit {
  timeoutMs?: number;
}

export async function httpJson<T>(url: string, opts: HttpJsonOptions = {}): Promise<T> {
  const { timeoutMs = 4000, ...init } = opts;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ac.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
