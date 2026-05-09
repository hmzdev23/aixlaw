import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type {
  DealSession,
  GhostEngine,
  GhostProfile,
  SpellbookIssue,
} from "@/contracts";
import { jsonChat } from "../_shared/anthropic";
import { TtlCache } from "../_shared/cache";
import { env } from "../_shared/env";
import { EngineError } from "../_shared/errors";
import { repoRoot } from "../_shared/paths";
import { loadPrecedents } from "../_shared/precedents";
import { chunkPrecedents } from "./chunker";
import { GHOST_SYSTEM_PROMPT, ghostUserPrompt } from "./prompts";
import { Retriever } from "./retrieve";

/**
 * Ghost generation strategy:
 *   1. Load + chunk synthetic precedent JSON corpus (clause-grain).
 *   2. Run BM25 over a fixed set of "what makes this counterparty hard?"
 *      probe queries (data residency, audit, breach, IP, insurance, step-in).
 *   3. Send the top hits to Claude with a strict JSON schema prompt.
 *   4. Parse + validate; fall back to canned profile on any failure
 *      (or when LLM is disabled).
 *   5. Cache per (counterpartyId, locale) for an hour.
 */

const GhostProfileSchema = z.object({
  counterpartyId: z.string().min(1),
  displayName: z.string().min(1),
  elo: z.number().int().min(1500).max(2400),
  styleLabel: z.string().min(1),
  playstyle: z.string().min(20),
  fightsOn: z.array(z.string().min(3)).min(3),
  oftenConcedes: z.array(z.string().min(3)).min(3),
  walksWhen: z.array(z.string().min(3)).min(3),
  trainingSummary: z.string().min(5),
  precedentDealIds: z.array(z.string().min(1)).min(1),
}) satisfies z.ZodType<GhostProfile>;

const PROBE_QUERIES = [
  "uncapped breach liability section 9 data protection",
  "audit rights frequency notice",
  "ontario data residency cross-border",
  "step-in rights operational resilience",
  "cyber insurance minimum",
  "twenty-four hour breach notification",
  "termination convenience cure period",
  "intellectual property custom developments",
] as const;

const cache = new TtlCache<string, GhostProfile>(60 * 60 * 1000);
const RAW_PROFILE_TTL_MS = 60 * 60 * 1000;

export async function loadCannedGhost(): Promise<GhostProfile> {
  const file = path.join(
    repoRoot(),
    "src/lib/fixtures/ghost_canned.json"
  );
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (e) {
    throw new EngineError({
      code: "fixture_missing",
      message: "ghost_canned.json missing",
      cause: e,
    });
  }
  const parsed = GhostProfileSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new EngineError({
      code: "validation_failed",
      message: `ghost_canned.json failed schema: ${parsed.error.message}`,
    });
  }
  return parsed.data;
}

class GhostEngineImpl implements GhostEngine {
  async generate(session: DealSession): Promise<GhostProfile> {
    if (!session?.dealId) {
      throw new EngineError({
        code: "bad_request",
        message: "DealSession missing dealId",
      });
    }
    const cacheKey = `ghost:${session.counterpartyId}:${session.locale}`;
    const hit = cache.get(cacheKey);
    if (hit) return hit;

    if (env.llmDisabled) {
      const canned = await loadCannedGhost();
      cache.set(cacheKey, canned, RAW_PROFILE_TTL_MS);
      return canned;
    }

    try {
      const precedents = await loadPrecedents(
        session.precedentRefs.map((id) => `${id}.json`)
      );
      const allChunks = chunkPrecedents(precedents);
      const retriever = new Retriever(allChunks);

      const seen = new Set<string>();
      const top: typeof allChunks = [];
      for (const q of PROBE_QUERIES) {
        for (const hit of retriever.search(q, 2)) {
          if (seen.has(hit.chunk.id)) continue;
          seen.add(hit.chunk.id);
          top.push(hit.chunk);
        }
      }

      const profile = await jsonChat(GhostProfileSchema, {
        system: GHOST_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: ghostUserPrompt({
              counterpartyId: session.counterpartyId,
              displayName: "INITECH PROCUREMENT · Regulated FI",
              precedentChunks: top.length > 0 ? top : allChunks,
            }),
          },
        ],
      });

      cache.set(cacheKey, profile, RAW_PROFILE_TTL_MS);
      return profile;
    } catch (e) {
      if (env.debug) console.warn("[ghost] LLM failed, using canned:", e);
      const canned = await loadCannedGhost();
      cache.set(cacheKey, canned, RAW_PROFILE_TTL_MS);
      return canned;
    }
  }

  async refreshFromIssues(
    session: DealSession,
    issues: SpellbookIssue[]
  ): Promise<GhostProfile> {
    const base = await this.generate(session);

    if (!issues || issues.length === 0) return base;

    // Bump high-severity issue topics into fightsOn (deduped).
    const highTitles = issues
      .filter((i) => i.severity === "high")
      .map((i) => `${i.title} (Spellbook flagged ${i.clauseRef})`);

    if (highTitles.length === 0) return base;

    const merged: GhostProfile = {
      ...base,
      fightsOn: dedup([...highTitles, ...base.fightsOn]).slice(0, 8),
      trainingSummary: `${base.trainingSummary} · refreshed with ${issues.length} Spellbook issues`,
    };

    const cacheKey = `ghost:${session.counterpartyId}:${session.locale}`;
    cache.set(cacheKey, merged, RAW_PROFILE_TTL_MS);
    return merged;
  }
}

function dedup<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export const ghostEngine: GhostEngine = new GhostEngineImpl();

/** Test only. */
export function __resetGhostCacheForTests(): void {
  cache.clear();
}
