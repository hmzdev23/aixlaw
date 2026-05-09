import path from "node:path";
import { FIXTURE_DIR } from "@/lib/contracts";

/**
 * Resolve a path inside the read-only Spellbook fixture dir at the repo root.
 * Server-only. Always anchored to process.cwd() so it works on Vercel
 * (where cwd is the project root) and in `next dev`.
 */
export function fixturePath(...segments: string[]): string {
  return path.join(process.cwd(), FIXTURE_DIR, ...segments);
}

/** Canonical paths used across T7/T8/T9. Mirrors docs/DEMO_FIXTURES.md §1. */
export const FIXTURE_PATHS = {
  scenarioBrief: "scenario_context.md",
  ndaOriginal: "nda_dunder_original.md",
  ndaRedlined: "nda_initech_redlines.md",
  msaOriginal: "msa_dunder_original.md",
  msaRedlined: "msa_initech_redlines.md",
} as const;

export type FixtureKey = keyof typeof FIXTURE_PATHS;
