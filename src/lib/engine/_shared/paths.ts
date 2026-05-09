import path from "node:path";
import { FIXTURE_DIR } from "@/contracts";

/**
 * Resolve a path inside the read-only Spellbook fixture directory at the repo root.
 * Centralized so engine code never embeds the literal "Example Scenario (Optional)"
 * outside of `FIXTURE_DIR`.
 */
export function repoRoot(): string {
  // engine modules are in src/lib/engine/_shared/<file>; cwd is the project root in
  // every Next.js runtime + vitest run we use, so `process.cwd()` is the safe choice.
  return process.cwd();
}

export function fixturePath(...segments: string[]): string {
  return path.join(repoRoot(), FIXTURE_DIR, ...segments);
}

export function precedentPath(file: string): string {
  return fixturePath("precedents", file);
}
