import { z } from "zod";
import type {
  AiVsAiInput,
  AiVsAiService,
  DebateEvent,
  GhostProfile,
} from "@/contracts";
import { jsonChat } from "../_shared/anthropic";
import { env } from "../_shared/env";
import { EngineError } from "../_shared/errors";
import { loadGhostFixture } from "../_shared/ghostFixtures";

/**
 * AiVsAiService: two ghost-conditioned agents alternate on a single clause.
 *
 * Stream is the same DebateEvent type as the Council so the War Room UI can
 * render either flow with one component. Tags are `counterpart_left` and
 * `counterpart_right` (not Council roles).
 *
 * Default scenario: Initech (left) vs Dunder Founder (right) on MSA §7.1.
 */

const TurnSchema = z.object({
  message: z.string().min(3).max(280),
  concedes: z.boolean().optional(),
});
type TurnPayload = z.infer<typeof TurnSchema>;

const AI_VS_AI_SYSTEM_PROMPT = `You are role-playing one side of a contract negotiation.

Output ONLY one JSON object per turn: { "message": "<one short sentence ≤180 chars>", "concedes": true|false (optional) }

Rules:
- Stay in character based on the supplied ghost profile.
- Reference your fights-on / often-concedes / walks-when posture.
- "concedes": true ONLY when the message accepts the other side's last position.
- Do NOT include speech tags or quotation marks around your message.`;

class AiVsAiServiceImpl implements AiVsAiService {
  async *runClauseNegotiation(input: AiVsAiInput): AsyncIterable<DebateEvent> {
    if (!input?.clauseText) {
      throw new EngineError({
        code: "bad_request",
        message: "clauseText is required",
      });
    }
    if (input.maxRounds <= 0 || input.maxRounds > 12) {
      throw new EngineError({
        code: "bad_request",
        message: "maxRounds must be in [1, 12]",
      });
    }

    const left = await loadGhostFixture(input.leftGhostId);
    const right = await loadGhostFixture(input.rightGhostId);

    if (env.llmDisabled) {
      // Deterministic 4-turn canned dialogue keeps demos snappy and offline.
      yield* cannedDialogue(left, right, input);
      return;
    }

    const transcript: { side: "left" | "right"; message: string }[] = [];

    for (let round = 0; round < input.maxRounds; round += 1) {
      const side: "left" | "right" = round % 2 === 0 ? "left" : "right";
      const speaker = side === "left" ? left : right;
      const opponent = side === "left" ? right : left;
      const userPrompt = buildAiVsAiUserPrompt({
        clauseText: input.clauseText,
        speaker,
        opponent,
        transcript,
      });

      let turn: TurnPayload;
      try {
        turn = await jsonChat(TurnSchema, {
          system: AI_VS_AI_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
          maxTokens: 250,
        });
      } catch (e) {
        if (env.debug) console.warn("[aivsai] LLM failed, switching to canned:", e);
        // Yield the canned dialogue so the UI still completes the round.
        yield* cannedDialogue(left, right, input);
        return;
      }

      transcript.push({ side, message: turn.message });

      yield {
        t: round * 350,
        agent: side === "left" ? "counterpart_left" : "counterpart_right",
        message: turn.message,
        vote: turn.concedes ? "accept" : undefined,
        influenceDelta: 0.05,
      };

      if (turn.concedes) return;
    }
  }
}

function buildAiVsAiUserPrompt(opts: {
  clauseText: string;
  speaker: GhostProfile;
  opponent: GhostProfile;
  transcript: { side: "left" | "right"; message: string }[];
}): string {
  const transcriptStr =
    opts.transcript.length === 0
      ? "(opening turn)"
      : opts.transcript
          .map((t) => `${t.side === "left" ? "LEFT" : "RIGHT"}: ${t.message}`)
          .join("\n");

  return `Clause under negotiation:
"""
${opts.clauseText}
"""

You are: ${opts.speaker.displayName} (style ${opts.speaker.styleLabel}).
- Fights on: ${opts.speaker.fightsOn.slice(0, 3).join("; ")}
- Often concedes: ${opts.speaker.oftenConcedes.slice(0, 3).join("; ")}
- Walks when: ${opts.speaker.walksWhen.slice(0, 3).join("; ")}

Opponent: ${opts.opponent.displayName} (style ${opts.opponent.styleLabel}).

Conversation so far:
${transcriptStr}

Reply with ONE short turn from your side. Concede only if the opponent's last position lands inside your "often concedes" zone.`;
}

/**
 * Deterministic 4-turn dialogue when LLM is disabled. Keeps demos snappy and
 * still scenario-true (Initech hardline → Dunder counter → Initech soft → done).
 */
async function* cannedDialogue(
  left: GhostProfile,
  right: GhostProfile,
  input: AiVsAiInput
): AsyncIterable<DebateEvent> {
  const turns: { side: "left" | "right"; message: string; concedes?: boolean }[] = [
    {
      side: "left",
      message: `As drafted, Section 9 carve-out and 24-hour breach notification are non-negotiable for ${left.displayName}.`,
    },
    {
      side: "right",
      message: `${right.displayName} cannot accept uncapped exposure. We propose a $5M aggregate cap with a $3M Section 9 sub-cap and the 24-hour notice.`,
    },
    {
      side: "left",
      message: `${left.displayName} can hold the cap structure if we add ISO 27001 evidence annually and step-in rights only on documented vendor failure.`,
    },
    {
      side: "right",
      message: `${right.displayName} accepts the structure, ISO evidence on annual cadence, and step-in scoped to documented failure with 30-day cure.`,
      concedes: true,
    },
  ];
  const upTo = Math.min(turns.length, Math.max(2, input.maxRounds));
  for (let i = 0; i < upTo; i += 1) {
    const t = turns[i];
    yield {
      t: i * 350,
      agent: t.side === "left" ? "counterpart_left" : "counterpart_right",
      message: t.message,
      vote: t.concedes ? "accept" : undefined,
      influenceDelta: 0.05,
    };
    if (t.concedes) return;
  }
}

export const aiVsAiService: AiVsAiService = new AiVsAiServiceImpl();
