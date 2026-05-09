import type { GhostProfile } from "@/contracts";

export const TREE_SYSTEM_PROMPT = `You are the "Tree" sub-engine in Gambit. You generate exactly three candidate counter-moves for a contract negotiation, ordered from "Brilliant" to "Blunder", and you return them as strict JSON.

Rules:
- Output ONLY a single valid JSON object matching the schema in the user message. No prose, no markdown fences.
- The "primaryBranchIds" array MUST list the three move ids in this order: brilliant ("!!"), risky ("?!"), blunder ("??").
- "closeProbability" must be in [0,1]. Brilliant > Risky; Blunder is highest probability but with negative retainedValueCad.
- "retainedValueCad" is the deal-NPV impact in CAD (signed integer, negative when value is destroyed).
- Each move "summary" is one sentence (≤160 chars), tactical, no hedging.
- Each "label" is the move itself (≤120 chars), as if you were writing in a senior partner's playbook.
- "ghostReplyPreview" must be 1 short sentence describing how the counterparty likely responds; cite the counterparty name.`;

interface TreeUserPromptInput {
  ghost: GhostProfile;
  redlineSummary: string;
  evalScore: number;
}

export function treeUserPrompt(input: TreeUserPromptInput): string {
  const ghost = input.ghost;
  return `Counterparty profile:
- Name: ${ghost.displayName}
- ELO: ${ghost.elo} (${ghost.styleLabel})
- Fights on: ${ghost.fightsOn.join("; ")}
- Often concedes: ${ghost.oftenConcedes.join("; ")}
- Walks when: ${ghost.walksWhen.join("; ")}

Current position eval: ${input.evalScore} (negative = behind).

Redlines under review (summary):
${input.redlineSummary}

Return JSON with exactly this shape (ids must be unique, three branches, ordered !!, ?!, ??):

{
  "rootId": "n_root",
  "primaryBranchIds": ["n_a_brilliant", "n_b_risky", "n_c_blunder"],
  "evalScore": ${input.evalScore},
  "nodes": {
    "n_root": { "id": "n_root", "parentId": null, "childrenIds": ["n_a_brilliant","n_b_risky","n_c_blunder"] },
    "n_a_brilliant": {
      "id": "n_a_brilliant",
      "parentId": "n_root",
      "childrenIds": [],
      "ghostReplyPreview": "...",
      "move": {
        "id": "n_a_brilliant",
        "label": "...",
        "notation": "!!",
        "summary": "...",
        "closeProbability": 0.7..0.95,
        "retainedValueCad": positive integer,
        "riskNote": "..."
      }
    },
    "n_b_risky": { ... "notation": "?!" ... },
    "n_c_blunder": { ... "notation": "??" ... }
  }
}`;
}

export const COUNTER_SYSTEM_PROMPT = `You are the "Counter" sub-engine in Gambit. Given a candidate counter-move and the counterparty's Ghost profile, produce a single short sentence (max 240 characters) describing how the counterparty most likely responds. No hedging, no markdown, no JSON — return prose only.`;

interface CounterPromptInput {
  ghost: GhostProfile;
  moveLabel: string;
  moveSummary: string;
}

export function counterUserPrompt(input: CounterPromptInput): string {
  return `Counterparty: ${input.ghost.displayName} (style ${input.ghost.styleLabel}, fights on: ${input.ghost.fightsOn.slice(0, 3).join("; ")}).

Our candidate move:
  Label: ${input.moveLabel}
  Summary: ${input.moveSummary}

In one sentence, what do they send back?`;
}
