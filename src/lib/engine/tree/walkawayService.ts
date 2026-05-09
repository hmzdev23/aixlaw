import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type {
  DealSession,
  GhostProfile,
  WalkawayCitation,
  WalkawayLine,
  WalkawayService,
} from "@/contracts";
import { jsonChat } from "../_shared/anthropic";
import { TtlCache } from "../_shared/cache";
import { env } from "../_shared/env";
import { EngineError } from "../_shared/errors";
import { repoRoot } from "../_shared/paths";
import { loadPrecedents, type Precedent } from "../_shared/precedents";
import { chunkPrecedents } from "../ghost/chunker";

/**
 * WalkawayService: returns a threshold summary plus three citations whose
 * `quote` is **substring-verified** against at least one precedent's clause text.
 *
 * If the model proposes a quote that doesn't substring-match (paraphrasing,
 * hallucination), we replace it with the best lexical match from the same
 * precedent's clauses. If we still can't find ≥3 valid citations, we use the
 * canned walkaway file (which is hand-picked to substring-match).
 */

const WalkawayCitationSchema = z.object({
  dealLabel: z.string().min(1),
  clauseRef: z.string().min(1),
  quote: z.string().min(10),
});

const WalkawayLineSchema = z.object({
  thresholdSummary: z.string().min(10),
  citations: z.array(WalkawayCitationSchema).min(3).max(6),
}) satisfies z.ZodType<WalkawayLine>;

const cache = new TtlCache<string, WalkawayLine>(60 * 60 * 1000);

const CANNED_PATH = path.join(repoRoot(), "src/lib/fixtures/walkaway_canned.json");

export async function loadCannedWalkaway(): Promise<WalkawayLine> {
  let raw: string;
  try {
    raw = await fs.readFile(CANNED_PATH, "utf8");
  } catch (e) {
    throw new EngineError({
      code: "fixture_missing",
      message: "walkaway_canned.json missing",
      cause: e,
    });
  }
  const parsed = WalkawayLineSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new EngineError({
      code: "validation_failed",
      message: `walkaway_canned.json failed schema: ${parsed.error.message}`,
    });
  }
  return parsed.data;
}

class WalkawayServiceImpl implements WalkawayService {
  async getLine(
    session: DealSession,
    ghost: GhostProfile
  ): Promise<WalkawayLine> {
    if (!session?.dealId) {
      throw new EngineError({
        code: "bad_request",
        message: "DealSession missing dealId",
      });
    }
    const cacheKey = `walkaway:${session.counterpartyId}:${ghost.elo}`;
    const hit = cache.get(cacheKey);
    if (hit) return hit;

    if (env.llmDisabled) {
      const canned = await loadCannedWalkaway();
      cache.set(cacheKey, canned);
      return canned;
    }

    try {
      const precedents = await loadPrecedents(
        session.precedentRefs.map((id) => `${id}.json`)
      );
      const corpus = chunkPrecedents(precedents);

      const prompt = `Counterparty: ${ghost.displayName}.

Their walkaway triggers (from Ghost):
${ghost.walksWhen.map((w) => `- ${w}`).join("\n")}

Available precedent clauses (substring-quote verbatim — do NOT paraphrase):
${corpus
  .map(
    (c) => `- precedent="${c.precedentLabel}" clauseRef="${c.clause.ref}" text="${c.clause.text}"`
  )
  .join("\n")}

Return a single JSON object describing the walkaway threshold + at least 3 verbatim citations (substring matches of the clauses above):

{
  "thresholdSummary": "1-2 sentence summary of when they walk",
  "citations": [
    { "dealLabel": "...", "clauseRef": "...", "quote": "..." }, ...
  ]
}`;

      const candidate = await jsonChat(WalkawayLineSchema, {
        system: WALKAWAY_SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
        maxTokens: 1200,
      });

      const verified = await verifyAndRepair(candidate, precedents);
      cache.set(cacheKey, verified);
      return verified;
    } catch (e) {
      if (env.debug) console.warn("[walkaway] LLM failed, using canned:", e);
      const canned = await loadCannedWalkaway();
      cache.set(cacheKey, canned);
      return canned;
    }
  }
}

const WALKAWAY_SYSTEM_PROMPT = `You are the "Walkaway" sub-engine in Gambit. Output ONLY a single JSON object. Citation quotes MUST be exact substrings of the supplied clause texts (verbatim, no paraphrase). Use the precedent labels exactly as given.`;

async function verifyAndRepair(
  candidate: WalkawayLine,
  precedents: Precedent[]
): Promise<WalkawayLine> {
  const repaired: WalkawayCitation[] = [];

  for (const cit of candidate.citations) {
    const owner =
      precedents.find((p) => p.label === cit.dealLabel) ??
      precedents.find((p) =>
        p.clauses.some((cl) => cl.ref === cit.clauseRef)
      ) ??
      precedents[0];
    const clause =
      owner.clauses.find((cl) => cl.ref === cit.clauseRef) ?? owner.clauses[0];

    if (clause.text.includes(cit.quote)) {
      repaired.push({ ...cit, dealLabel: owner.label, clauseRef: clause.ref });
    } else {
      // Replace with the longest sentence-ish substring from the clause that is
      // semantically anchored (>40 chars), preserving the precedent label.
      repaired.push({
        dealLabel: owner.label,
        clauseRef: clause.ref,
        quote: bestSubstring(clause.text, cit.quote),
      });
    }
  }

  // If we somehow ended up with <3, top up from canned anchors.
  if (repaired.length < 3) {
    const canned = await loadCannedWalkaway();
    for (const c of canned.citations) {
      if (repaired.length >= 3) break;
      if (!repaired.find((r) => r.quote === c.quote)) repaired.push(c);
    }
  }

  return {
    thresholdSummary: candidate.thresholdSummary,
    citations: repaired.slice(0, 6),
  };
}

function bestSubstring(source: string, hint: string): string {
  // Use the longest token sequence from `hint` that appears verbatim in `source`,
  // falling back to the first 240 chars of source.
  const hintTokens = hint.split(/\s+/);
  for (let len = Math.min(20, hintTokens.length); len >= 4; len -= 1) {
    for (let i = 0; i + len <= hintTokens.length; i += 1) {
      const candidate = hintTokens.slice(i, i + len).join(" ");
      if (candidate.length >= 30 && source.includes(candidate)) {
        return candidate;
      }
    }
  }
  return source.slice(0, 240).trim();
}

export const walkawayService: WalkawayService = new WalkawayServiceImpl();

export function __resetWalkawayCacheForTests(): void {
  cache.clear();
}

export const __testInternals = { verifyAndRepair, bestSubstring };
