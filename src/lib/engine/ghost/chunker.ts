import type { Precedent, PrecedentClause } from "../_shared/precedents";

/**
 * Clause-aware chunking.
 *
 * Each precedent contributes one chunk per clause (already authored at clause
 * granularity in JSON). For longer free-form sources we'd split on heading
 * patterns (multi-line regex on `### N(.M)` markers); the precedent JSON makes
 * that unnecessary today.
 */

export interface PrecedentChunk {
  /** Stable composite id "precedentId#clauseRef" */
  id: string;
  precedentId: string;
  precedentLabel: string;
  precedentYear: number;
  outcome: Precedent["outcome"];
  clause: PrecedentClause;
  /** Tokens used for lexical scoring (already lowercased & punctuation-stripped). */
  tokens: string[];
}

const STOPWORDS = new Set([
  "a","an","and","any","are","as","at","be","but","by","for","from","has","have",
  "in","into","is","it","its","of","on","or","such","that","the","this","to","was",
  "will","with","shall","not","no","yes","upon","be","may",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function chunkPrecedent(precedent: Precedent): PrecedentChunk[] {
  return precedent.clauses.map((clause) => ({
    id: `${precedent.id}#${slugify(clause.ref)}`,
    precedentId: precedent.id,
    precedentLabel: precedent.label,
    precedentYear: precedent.year,
    outcome: precedent.outcome,
    clause,
    tokens: tokenize(`${clause.topic} ${clause.ref} ${clause.text}`),
  }));
}

export function chunkPrecedents(precedents: Precedent[]): PrecedentChunk[] {
  return precedents.flatMap(chunkPrecedent);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
