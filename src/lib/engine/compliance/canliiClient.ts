import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { TtlCache } from "../_shared/cache";
import { httpJson } from "../_shared/httpFetch";
import { repoRoot } from "../_shared/paths";

/**
 * CanLII verification client.
 *
 * - Live API path: requires `CANLII_API_KEY`. We use the metadata endpoint
 *   `https://api.canlii.org/v1/caseBrowse/...` which needs database+caseId.
 *   For a hackathon we use the **publicly indexable URL pattern** by
 *   constructing a search query against `https://www.canlii.org/en/search/`.
 *   Since live HTML scraping is brittle, the production-grade behavior is the
 *   **offline allowlist** loaded below; the API path is best-effort and
 *   degrades gracefully.
 *
 * - Offline path (default): match the normalized citation against
 *   `src/lib/fixtures/canlii_allowlist.json`. This is the path used for tests,
 *   `GAMBIT_DISABLE_CANLII=true`, and any time `CANLII_API_KEY` is unset.
 *
 * Cache: 24h. CanLII data does not move quickly.
 */

const AllowlistEntrySchema = z.object({
  match: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
  neutralCitation: z.string().min(1),
  sourceUrl: z.string().url(),
});

const AllowlistFileSchema = z.object({
  comment: z.string().optional(),
  cases: z.array(AllowlistEntrySchema),
});

export interface CanliiHit {
  title: string;
  neutralCitation: string;
  sourceUrl: string;
}

const cache = new TtlCache<string, CanliiHit | null>(24 * 60 * 60 * 1000);
let allowlistCache: AllowlistEntry[] | undefined;

interface AllowlistEntry {
  matches: Set<string>;
  hit: CanliiHit;
}

/**
 * Lower-case, strip punctuation/dashes, collapse whitespace. Generous on
 * what we accept so e.g. "Sattva — 2014 SCC 53" matches "sattva 2014 scc 53".
 * We deliberately keep alphanumerics + ASCII spaces only.
 */
export function normalizeCitation(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadAllowlist(): Promise<AllowlistEntry[]> {
  if (allowlistCache) return allowlistCache;
  const file = path.join(
    repoRoot(),
    "src/lib/fixtures/canlii_allowlist.json"
  );
  const raw = await fs.readFile(file, "utf8");
  const parsed = AllowlistFileSchema.parse(JSON.parse(raw));
  allowlistCache = parsed.cases.map((c) => ({
    matches: new Set(c.match.map(normalizeCitation)),
    hit: {
      title: c.title,
      neutralCitation: c.neutralCitation,
      sourceUrl: c.sourceUrl,
    },
  }));
  return allowlistCache;
}

function isCanliiDisabled(): boolean {
  if (process.env.GAMBIT_DISABLE_CANLII === "true") return true;
  return !process.env.CANLII_API_KEY;
}

/**
 * Look up a citation. Returns null when not found. Never throws — TrueSight
 * needs a stable contract regardless of network conditions.
 */
export async function verifyCitation(rawCitation: string): Promise<CanliiHit | null> {
  const key = normalizeCitation(rawCitation);
  if (!key) return null;

  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  // Always check the allowlist first; it's authoritative for our demo cases.
  const list = await loadAllowlist();
  for (const entry of list) {
    if (entry.matches.has(key)) {
      cache.set(key, entry.hit);
      return entry.hit;
    }
    // Also accept partial matches against the neutral citation suffix
    // (e.g. "2014 SCC 71" without the case name).
    for (const m of entry.matches) {
      if (key.endsWith(m) || m.endsWith(key)) {
        cache.set(key, entry.hit);
        return entry.hit;
      }
    }
  }

  if (isCanliiDisabled()) {
    cache.set(key, null);
    return null;
  }

  // Best-effort live lookup via the CanLII metadata endpoint. We don't have
  // database/caseId, so we fall back to a HEAD against a guessed URL pattern.
  // If that fails we return null.
  const guess = `https://www.canlii.org/en/?search=${encodeURIComponent(rawCitation)}&api_key=${process.env.CANLII_API_KEY}`;
  try {
    await httpJson(guess, { timeoutMs: 3500 });
    // We can't actually parse search results without HTML scraping, so we
    // mark the citation as "not found" rather than fabricate a hit.
    cache.set(key, null);
    return null;
  } catch {
    cache.set(key, null);
    return null;
  }
}

/** Test only. */
export function __resetCanliiForTests(): void {
  cache.clear();
  allowlistCache = undefined;
}
