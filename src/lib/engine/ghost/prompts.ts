/**
 * Prompt templates for the Ghost engine. Kept in TypeScript (not .md) so they
 * import cleanly without a file-read at runtime in serverless.
 */

import type { PrecedentChunk } from "./chunker";

export const GHOST_SYSTEM_PROMPT = `You are the "Counterparty Ghost" sub-engine in Gambit, a contract-negotiation cockpit.

Your job: read short clause excerpts from a counterparty's past vendor deals and synthesize a structured "ghost profile" of how they negotiate.

Hard rules:
- Output ONLY a single valid JSON object that matches the schema in the user message. No prose, no markdown fences.
- Lists ("fightsOn", "oftenConcedes", "walksWhen") MUST contain at least 3 distinct items each.
- "elo" is a composite stubbornness/hardness score in the range 1500..2400. Higher = harder. Treat aggressive carve-outs, audit rights, and uncapped exposures as hardness signals.
- "trainingSummary" must mention how many precedents and roughly how many clauses were analyzed.
- "precedentDealIds" must echo the precedent IDs you were given.
- Do NOT include legal advice or hedging language. The audience is a negotiation engine, not an end user.`;

export interface GhostUserPromptInput {
  counterpartyId: string;
  displayName: string;
  precedentChunks: PrecedentChunk[];
}

export function ghostUserPrompt(input: GhostUserPromptInput): string {
  const corpus = input.precedentChunks
    .map(
      (c) =>
        `- precedent: ${c.precedentId} (${c.precedentLabel}, ${c.precedentYear}, outcome=${c.outcome})\n  ${c.clause.ref} [topic=${c.clause.topic}]: "${c.clause.text}"`
    )
    .join("\n");

  const schema = `{
  "counterpartyId": "${input.counterpartyId}",
  "displayName": "${input.displayName}",
  "elo": 1500..2400,
  "styleLabel": "Hardline" | "Balanced" | "Cautious" | "Aggressive",
  "playstyle": "1-3 sentence prose summary of how they negotiate.",
  "fightsOn": ["...", "...", "..."],
  "oftenConcedes": ["...", "...", "..."],
  "walksWhen": ["...", "...", "..."],
  "trainingSummary": "Trained on N prior deals · M clauses analyzed",
  "precedentDealIds": [${input.precedentChunks
    .map((c) => `"${c.precedentId}"`)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(", ")}]
}`;

  return `Counterparty: ${input.displayName} (id="${input.counterpartyId}")

Precedent clause corpus:
${corpus}

Return JSON in exactly this shape:
${schema}`;
}
