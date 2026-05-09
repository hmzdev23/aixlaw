import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import type { PIA } from "@/contracts";
import { TtlCache } from "../_shared/cache";
import { repoRoot } from "../_shared/paths";
import { translator } from "./translator";

/**
 * Build a Privacy Impact Assessment (PIA) suitable for the Cockpit Law 25 panel.
 *
 *   1. Load EN + FR base templates (always shipped — PIA always has both).
 *   2. Substitute `{{token}}` placeholders.
 *   3. (Optional) When a Cloud Translation key is configured, run an EN→FR
 *      consistency pass per section so the FR copy stays aligned with the EN
 *      after token substitution. The hand-written FR templates are the
 *      fallback when translation is disabled or rate-limited.
 */

const PiaTemplateSchema = z.object({
  comment: z.string().optional(),
  sectionsEn: z.record(z.string(), z.string()),
  sectionsFr: z.record(z.string(), z.string()),
});

let templateCache: z.infer<typeof PiaTemplateSchema> | undefined;

const piaCache = new TtlCache<string, PIA>(60 * 60 * 1000);

async function loadTemplate(): Promise<z.infer<typeof PiaTemplateSchema>> {
  if (templateCache) return templateCache;
  const file = path.join(repoRoot(), "src/lib/fixtures/pia_template.json");
  const raw = await fs.readFile(file, "utf8");
  templateCache = PiaTemplateSchema.parse(JSON.parse(raw));
  return templateCache;
}

function substitute(template: string, tokens: Record<string, string>): string {
  if (!tokens || Object.keys(tokens).length === 0) {
    return template
      .replace(/\{\{vendor_displayName\}\}/g, "Vendor")
      .replace(/\{\{counterparty_displayName\}\}/g, "Counterparty");
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : `{{${key}}}`
  );
}

interface BuildPiaOptions {
  tokens?: Record<string, string>;
  /** Default true; pass false to skip the Cloud Translation consistency pass. */
  translateConsistencyPass?: boolean;
}

export async function buildPIA(opts: BuildPiaOptions = {}): Promise<PIA> {
  const tokens = opts.tokens ?? {};
  const cacheKey = JSON.stringify(tokens);
  const hit = piaCache.get(cacheKey);
  if (hit) return hit;

  const tpl = await loadTemplate();

  const en: Record<string, string> = {};
  for (const [k, v] of Object.entries(tpl.sectionsEn)) en[k] = substitute(v, tokens);

  const fr: Record<string, string> = {};
  for (const [k, v] of Object.entries(tpl.sectionsFr)) fr[k] = substitute(v, tokens);

  // Optional consistency pass: re-translate the EN section into FR so the FR
  // copy stays aligned with token substitutions. The hand-written FR template
  // remains the source of truth when translation isn't configured.
  if (opts.translateConsistencyPass !== false) {
    for (const k of Object.keys(en)) {
      const enriched = await translator.toFr(en[k]);
      // Only overwrite when translation actually produced FR content
      // (`toFr` returns identity-with-warning when no key is set).
      if (enriched && enriched !== en[k] && !enriched.startsWith("[FR translation unavailable")) {
        fr[k] = enriched;
      }
    }
  }

  const pia: PIA = {
    id: `pia_${randomUUID()}`,
    generatedAt: new Date().toISOString(),
    sectionsEn: en,
    sectionsFr: fr,
  };
  piaCache.set(cacheKey, pia);
  return pia;
}

export function __resetPiaForTests(): void {
  templateCache = undefined;
  piaCache.clear();
}
