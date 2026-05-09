/**
 * Tiny seedable PRNG (mulberry32) + deterministic-mode helper.
 *
 * Used by the Architect runtime so `GAMBIT_SEED=<n>` makes a playbook execution
 * reproducible. Demo-grade, not cryptographic.
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getSeedRng(): (() => number) | undefined {
  const raw = process.env.GAMBIT_SEED;
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return mulberry32(Math.floor(n));
}

/** Returns true when execution should be deterministic (LLM disabled or seeded). */
export function deterministicMode(): boolean {
  return Boolean(getSeedRng());
}
