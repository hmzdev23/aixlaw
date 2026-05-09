import type { CouncilRole, GhostProfile, VoteValue } from "@/contracts";

/** Agent identity + brief persona used in prompt construction. */
export const AGENT_DEFINITIONS: Record<
  Exclude<CouncilRole, "crown">,
  { label: string; persona: string }
> = {
  counsel: {
    label: "Counsel",
    persona:
      "Risk-averse internal lawyer. Focused on indemnity, IP, liability cap, termination, privacy, and breach exposure. Treats uncapped Section 9 carve-outs and convenience termination as existential.",
  },
  closer: {
    label: "Closer",
    persona:
      "Sales / business owner. Focused on revenue, deal speed, customer relationship, and time-to-signature. Tolerates risk if it preserves the deal velocity, but defers to Counsel on existential clauses.",
  },
  counterpart: {
    label: "Counterpart",
    persona:
      "Counterparty simulator. Predicts how the counterparty (Initech procurement) responds to a given move, conditioned on their Ghost profile (fights-on, often-concedes, walks-when).",
  },
  compliance: {
    label: "Compliance",
    persona:
      "Wraps the Compliance engine (TrueSight + OSFI + PIPEDA + Law25). Reports a tri-regime posture with a single CLEAR/REJECT vote.",
  },
};

const VOTE_VALUES: VoteValue[] = [
  "accept",
  "reject",
  "likely_counter_accept",
  "clear",
  "abstain",
];

export const COUNCIL_VOTES_SYSTEM_PROMPT = `You are the Gambit War Room — five agents around a table debating a contract negotiation move.

Your job: produce ONE JSON object with the votes and one-sentence opinions of FOUR agents (Counsel, Closer, Counterpart, Compliance) for the supplied candidate move. Crown synthesizes separately.

Rules:
- Output ONLY a single valid JSON object matching the schema below. No prose, no markdown fences.
- Each agent's "message" is one sentence (≤180 chars), in their voice. No hedging.
- Each "vote" MUST be one of: ${VOTE_VALUES.map((v) => `"${v}"`).join(", ")}.
- Counsel uses "accept" or "reject" or "abstain"; never "likely_counter_accept" or "clear".
- Closer uses "accept" / "reject" / "abstain".
- Counterpart uses "likely_counter_accept" / "reject" (counterparty walks) / "abstain"; never "clear".
- Compliance uses "clear" or "reject"; never "accept".
- "influenceDelta" is a number in [0, 0.3] reflecting how strongly this agent argued.`;

export interface CouncilVotesPayload {
  counsel: { message: string; vote: VoteValue; influenceDelta: number };
  closer: { message: string; vote: VoteValue; influenceDelta: number };
  counterpart: { message: string; vote: VoteValue; influenceDelta: number };
  compliance: { message: string; vote: VoteValue; influenceDelta: number };
}

export function councilVotesUserPrompt(opts: {
  ghost: GhostProfile;
  moveLabel: string;
  moveSummary: string;
  moveNotation: string;
  evalScore: number;
  complianceSummary: string;
}): string {
  const ghost = opts.ghost;

  return `Counterparty profile:
- Name: ${ghost.displayName}
- ELO: ${ghost.elo} (${ghost.styleLabel})
- Fights on: ${ghost.fightsOn.slice(0, 5).join("; ")}
- Often concedes: ${ghost.oftenConcedes.slice(0, 5).join("; ")}
- Walks when: ${ghost.walksWhen.slice(0, 5).join("; ")}

Current eval: ${opts.evalScore} (negative = behind).

Compliance posture (from engine):
${opts.complianceSummary}

Candidate move under review:
- Notation: ${opts.moveNotation}
- Label: ${opts.moveLabel}
- Summary: ${opts.moveSummary}

Return JSON:
{
  "counsel":     { "message": "...", "vote": "accept|reject|abstain",                "influenceDelta": 0.0..0.3 },
  "closer":      { "message": "...", "vote": "accept|reject|abstain",                "influenceDelta": 0.0..0.3 },
  "counterpart": { "message": "...", "vote": "likely_counter_accept|reject|abstain", "influenceDelta": 0.0..0.3 },
  "compliance":  { "message": "...", "vote": "clear|reject",                          "influenceDelta": 0.0..0.3 }
}`;
}

export const CROWN_SYSTEM_PROMPT = `You are the Crown — Gambit's Move Scorer. You synthesize the four agents' votes into a single recommendation.

Output ONLY one JSON object: { "message": "<one sentence ≤180 chars>", "vote": "accept|reject|likely_counter_accept" }

Rules:
- Begin "message" with "Following <agent>(s): " naming the agents whose argument carried the day (e.g. "Following Counsel + Compliance: ACCEPT Move A.").
- Vote "reject" if Counsel rejects on existential grounds OR Counterpart predicts walk OR Compliance rejects.
- Vote "accept" only when at least Counsel + Compliance favor the move.
- Otherwise vote "likely_counter_accept" (deal proceeds with caveats).`;

export interface CrownPayload {
  message: string;
  vote: VoteValue;
}

export function crownUserPrompt(opts: {
  moveLabel: string;
  moveNotation: string;
  votes: CouncilVotesPayload;
}): string {
  return `Move under synthesis: [${opts.moveNotation}] ${opts.moveLabel}

Agent votes:
- Counsel:     ${opts.votes.counsel.vote.toUpperCase()} — "${opts.votes.counsel.message}"
- Closer:      ${opts.votes.closer.vote.toUpperCase()} — "${opts.votes.closer.message}"
- Counterpart: ${opts.votes.counterpart.vote.toUpperCase()} — "${opts.votes.counterpart.message}"
- Compliance:  ${opts.votes.compliance.vote.toUpperCase()} — "${opts.votes.compliance.message}"

Synthesize a Crown recommendation per the rules.`;
}
