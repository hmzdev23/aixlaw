import { promises as fs } from "node:fs";
import path from "node:path";
import type { TrueSightResult } from "@/contracts";
import { repoRoot } from "../_shared/paths";
import { CanliiHit, verifyCitation } from "./canliiClient";

/**
 * TrueSight: hallucinated-citation interception.
 *
 *   1. Extract Canadian-style citations from the input text (regex).
 *   2. For each, ask the CanliiClient to verify.
 *   3. If `dealId === "demo"` and the text contains a known-bad demo
 *      citation, force a substitution from `truesight_inject.json` so the
 *      stage demo is deterministic.
 *   4. Build a `TrueSightResult` whose top-level `status` is the worst of
 *      `clean | unverified | substituted`.
 *
 * Returned `TrueSightResult` always carries an `extracted` array with span
 * offsets (start/end) so the UI can render strikethroughs in place. The Zod
 * shape in DATA_MODELS.md only requires `original/verified/sourceUrl` per
 * claim, so spans live on a non-typed extension that the route handler
 * passes through.
 */

const NEUTRAL_CITATION_RE =
  /\b(?<!\d)(?:1[89]|20)\d{2}\s+(?:SCC|FCA|FC|ABCA|ABKB|ABQB|BCCA|BCSC|MBCA|MBKB|MBQB|NBCA|NBQB|NLCA|NLSC|NSCA|NSSC|NUCA|NUCJ|ONCA|ONSC|ONCJ|PECA|PESC|QCCA|QCCS|QCCQ|SKCA|SKQB|YKCA|YKSC|YKTC|CanLII|TCC|FedCt|CHRT)(?:\s+\(?[A-Z]+\)?)?\s+\d+\b/g;

const REPORTER_RE =
  /\(?\b(?:1[89]|20)\d{2}\)?,?\s+\d+\s+[A-Z][A-Za-z.]+\s+\(?(?:\d{1,2}(?:st|nd|rd|th)?)\)?\s+\d+/g;

interface InjectMapping {
  bad: string;
  good: {
    citation: string;
    title: string;
    neutralCitation: string;
    sourceUrl: string;
    reason?: string;
  };
}

let injectCache: InjectMapping[] | undefined;
async function loadInjectMappings(): Promise<InjectMapping[]> {
  if (injectCache) return injectCache;
  const file = path.join(repoRoot(), "src/lib/fixtures/truesight_inject.json");
  const raw = await fs.readFile(file, "utf8");
  const parsed = JSON.parse(raw) as { substitutions: InjectMapping[] };
  injectCache = parsed.substitutions;
  return injectCache;
}

export interface ExtractedCitation {
  raw: string;
  start: number;
  end: number;
}

export function extractCitations(text: string): ExtractedCitation[] {
  if (!text) return [];
  const out: ExtractedCitation[] = [];

  for (const re of [NEUTRAL_CITATION_RE, REPORTER_RE]) {
    re.lastIndex = 0;
    for (let m: RegExpExecArray | null; (m = re.exec(text)) !== null; ) {
      // Try to swallow a leading case-name + " v. " segment, e.g. "Bhasin v. Hrynew, 2014 SCC 71".
      const start = expandLeftToCaseName(text, m.index);
      const end = m.index + m[0].length;
      out.push({ raw: text.slice(start, end), start, end });
    }
  }

  // De-duplicate overlapping ranges (prefer earliest start, longest range).
  out.sort((a, b) => a.start - b.start || b.end - a.end);
  const dedup: ExtractedCitation[] = [];
  for (const ec of out) {
    const last = dedup.at(-1);
    if (!last || ec.start >= last.end) dedup.push(ec);
  }
  return dedup;
}

function expandLeftToCaseName(text: string, citationStart: number): number {
  // Scan back up to 120 chars looking for a "v." pattern; stop at sentence break.
  const lookbehind = Math.max(0, citationStart - 120);
  const window = text.slice(lookbehind, citationStart);
  const match = window.match(/[A-Z][A-Za-z.\u2019' -]+\s+v\.\s+[A-Z][A-Za-z.\u2019' -]+,?\s*$/);
  if (match) return lookbehind + (window.length - match[0].length);
  // No leading case-name; keep just the citation.
  return citationStart;
}

interface TrueSightOptions {
  dealId?: string;
}

export interface TrueSightResultExtended extends TrueSightResult {
  extracted: ExtractedCitation[];
}

export async function runTrueSight(
  text: string,
  opts: TrueSightOptions = {}
): Promise<TrueSightResultExtended> {
  const extracted = extractCitations(text);
  const claims: TrueSightResult["claims"] = [];

  if (extracted.length === 0) {
    return { status: "clean", claims: [], extracted: [] };
  }

  const inject = opts.dealId === "demo" ? await loadInjectMappings() : [];

  let worst: TrueSightResult["status"] = "clean";
  for (const ec of extracted) {
    // 1) demo inject — strict equality on the `bad` substring.
    const inj = inject.find((i) => ec.raw.includes(i.good.title) ? false : ec.raw.includes(i.bad) || text.includes(i.bad));
    if (inj) {
      claims.push({
        original: inj.bad,
        verified: inj.good.citation,
        sourceUrl: inj.good.sourceUrl,
      });
      worst = "substituted";
      continue;
    }

    // 2) try direct verification of the captured slice (case-name + cite).
    let hit: CanliiHit | null = await verifyCitation(ec.raw);
    if (!hit) {
      // Try the citation alone (without case-name) — many extractions include
      // both, but the allowlist is keyed by neutral citation too.
      const neutral = ec.raw.match(NEUTRAL_CITATION_RE);
      if (neutral && neutral[0]) hit = await verifyCitation(neutral[0]);
    }

    if (hit) {
      claims.push({
        original: ec.raw,
        verified: `${hit.title}, ${hit.neutralCitation}`,
        sourceUrl: hit.sourceUrl,
      });
    } else {
      claims.push({ original: ec.raw });
      if (worst === "clean") worst = "unverified";
    }
  }

  return { status: worst, claims, extracted };
}

export function __resetTrueSightForTests(): void {
  injectCache = undefined;
}
