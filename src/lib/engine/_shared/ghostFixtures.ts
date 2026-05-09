import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { GhostProfile } from "@/contracts";
import { EngineError } from "./errors";
import { repoRoot } from "./paths";

/**
 * Loader for fixture-backed ghost profiles outside the live RAG pipeline.
 * Used by AI-vs-AI to materialize the `dunder_founder` persona, and by tests.
 */

const GhostProfileFixtureSchema = z.object({
  counterpartyId: z.string().min(1),
  displayName: z.string().min(1),
  elo: z.number().int().min(1500).max(2400),
  styleLabel: z.string().min(1),
  playstyle: z.string().min(20),
  fightsOn: z.array(z.string().min(3)).min(3),
  oftenConcedes: z.array(z.string().min(3)).min(3),
  walksWhen: z.array(z.string().min(2)).min(1),
  trainingSummary: z.string().min(5),
  precedentDealIds: z.array(z.string()),
}) satisfies z.ZodType<GhostProfile>;

const FIXTURE_FILES: Record<string, string> = {
  initech_procurement: "src/lib/fixtures/ghost_canned.json",
  dunder_founder: "src/lib/fixtures/dunder_founder_ghost.json",
};

const cache = new Map<string, GhostProfile>();

export async function loadGhostFixture(id: string): Promise<GhostProfile> {
  const cached = cache.get(id);
  if (cached) return cached;
  const file = FIXTURE_FILES[id];
  if (!file) {
    throw new EngineError({
      code: "not_found",
      message: `Unknown ghost id: ${id}`,
    });
  }
  let raw: string;
  try {
    raw = await fs.readFile(path.join(repoRoot(), file), "utf8");
  } catch (e) {
    throw new EngineError({
      code: "fixture_missing",
      message: `Ghost fixture missing: ${file}`,
      cause: e,
    });
  }
  const parsed = GhostProfileFixtureSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new EngineError({
      code: "validation_failed",
      message: `Ghost fixture ${file} failed schema: ${parsed.error.message}`,
    });
  }
  cache.set(id, parsed.data);
  return parsed.data;
}

export function __resetGhostFixtureCacheForTests(): void {
  cache.clear();
}
