/**
 * Cross-route singleton via globalThis.
 *
 * Why: Next.js App Router in dev compiles a fresh module graph per route, so
 * module-level `const x = new Map()` produces a separate Map per route. In
 * production (single Lambda process) they collapse to one, but the dev
 * experience is broken. Pinning the value to globalThis makes the in-memory
 * stores behave identically in `next dev` and `next start`.
 *
 * Pattern (Prisma uses the same idiom):
 *
 *     const fooStore = singleton("foo:store", () => new Map<string, Foo>());
 */

const KEY = Symbol.for("gambit.singletons");

interface Bag {
  [name: string]: unknown;
}

function bag(): Bag {
  const g = globalThis as unknown as { [k: symbol]: Bag };
  if (!g[KEY]) g[KEY] = {};
  return g[KEY];
}

export function singleton<T>(name: string, factory: () => T): T {
  const b = bag();
  if (b[name] === undefined) {
    b[name] = factory();
  }
  return b[name] as T;
}

/** Test-only. Drops a registered singleton so the next call rebuilds it. */
export function __resetSingleton(name: string): void {
  delete bag()[name];
}
