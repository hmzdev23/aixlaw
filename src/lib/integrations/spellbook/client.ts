/**
 * Spellbook client. Server-only.
 *
 * docs/tasks/09 §Spellbook client:
 *   - SPELLBOOK_API_KEY path: POST per Spellbook docs (placeholder URL).
 *   - Pass full text + { kind: "msa" | "nda" }.
 *   - Fallback: read fixtures/spellbook_issues.json aligned to R01–R13.
 *   - Spellbook errors must NOT block the demo; downgrade to fixtures.
 *
 * NOTE: We do not have a public Spellbook trial endpoint. The real-API path
 * is implemented behind feature-flag env vars; without them we silently use
 * the bundled fixture.
 */

import type {
  SpellbookClient,
  SpellbookIssue,
} from "@/lib/contracts";
import fixture from "@/lib/fixtures/spellbook_issues.json";
import { logger } from "@/lib/util/logger";

interface FixtureFile {
  msa: SpellbookIssue[];
  nda: SpellbookIssue[];
}

const FIXTURE = fixture as unknown as FixtureFile;

class SpellbookClientImpl implements SpellbookClient {
  async detectIssues(
    fullText: string,
    meta?: { kind: "nda" | "msa" },
  ): Promise<SpellbookIssue[]> {
    const kind: "nda" | "msa" = meta?.kind ?? inferKind(fullText);

    const apiKey = process.env.SPELLBOOK_API_KEY;
    const apiUrl = process.env.SPELLBOOK_API_URL;
    if (apiKey && apiUrl) {
      try {
        const live = await callLiveApi(apiUrl, apiKey, fullText, kind);
        if (live.length > 0) return live;
        logger.warn("spellbook live api returned empty; using fixture");
      } catch (err) {
        logger.warn("spellbook live api failed; using fixture", {
          err: (err as Error).message,
        });
      }
    }
    return loadFixture(kind);
  }
}

function inferKind(text: string): "nda" | "msa" {
  // Cheap heuristic — the demo path always passes meta explicitly anyway.
  return /master service/i.test(text) ? "msa" : "nda";
}

function loadFixture(kind: "nda" | "msa"): SpellbookIssue[] {
  return kind === "nda" ? FIXTURE.nda : FIXTURE.msa;
}

interface SpellbookApiPayload {
  text: string;
  kind: "nda" | "msa";
}

async function callLiveApi(
  url: string,
  key: string,
  text: string,
  kind: "nda" | "msa",
): Promise<SpellbookIssue[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const payload: SpellbookApiPayload = { text, kind };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`spellbook api ${res.status}`);
    }
    const data = (await res.json()) as { issues?: SpellbookIssue[] };
    return Array.isArray(data.issues) ? data.issues : [];
  } finally {
    clearTimeout(timer);
  }
}

let cached: SpellbookClientImpl | undefined;
export function getSpellbookClient(): SpellbookClientImpl {
  if (!cached) cached = new SpellbookClientImpl();
  return cached;
}

export { loadFixture as loadSpellbookFixture };
