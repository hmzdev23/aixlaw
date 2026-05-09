/**
 * Voice sign-off state machine. Server-only.
 *
 * docs/tasks/08 §"Voice sign-off":
 *   States:  pending -> playing -> signed | rejected
 *   APIs:    POST /api/signoff/start, /api/signoff/complete
 *   Storage: in-memory map dealId -> state
 *
 * The audio asset itself is `public/demo/sarah-send-it.m4a`. The route layer
 * only flips state — the <audio> element on the Cockpit handles playback and
 * the `ended` event triggers /complete.
 */

import type {
  SignoffState,
  VoiceSignoffService,
} from "@/lib/contracts";
import { singleton, __resetSingleton } from "@/lib/util/globalSingleton";

export interface SignoffRecord {
  dealId: string;
  state: SignoffState;
  signedBy?: string;
  startedAt?: string;
  completedAt?: string;
  approved?: boolean;
}

function records(): Map<string, SignoffRecord> {
  return singleton<Map<string, SignoffRecord>>(
    "voice:signoff",
    () => new Map<string, SignoffRecord>(),
  );
}

const ALLOWED_TRANSITIONS: Record<SignoffState, SignoffState[]> = {
  pending: ["playing"],
  playing: ["signed", "rejected"],
  signed: [],
  rejected: ["pending"], // allow retry from rejection
};

function transition(
  prev: SignoffState | undefined,
  next: SignoffState,
): boolean {
  if (!prev) return next === "pending" || next === "playing";
  return ALLOWED_TRANSITIONS[prev].includes(next);
}

class VoiceSignoffServiceImpl implements VoiceSignoffService {
  async startPlayback(dealId: string): Promise<void> {
    const prev = records().get(dealId)?.state;
    const next: SignoffState = "playing";
    if (!transition(prev ?? "pending", next) && prev !== "pending" && prev) {
      // Idempotent restart from pending; reject otherwise.
      throw signoffError(
        `Cannot transition ${prev} -> ${next}`,
        "invalid_transition",
        409,
      );
    }
    records().set(dealId, {
      dealId,
      state: "playing",
      startedAt: new Date().toISOString(),
    });
  }

  async completeSignoff(dealId: string, approved: boolean): Promise<void> {
    const cur = records().get(dealId);
    if (!cur) {
      throw signoffError(
        "Sign-off has not been started for this deal.",
        "not_started",
        409,
      );
    }
    const next: SignoffState = approved ? "signed" : "rejected";
    if (!transition(cur.state, next)) {
      throw signoffError(
        `Cannot transition ${cur.state} -> ${next}`,
        "invalid_transition",
        409,
      );
    }
    records().set(dealId, {
      ...cur,
      state: next,
      approved,
      completedAt: new Date().toISOString(),
      signedBy: approved ? "Sarah Chen" : undefined,
    });
  }

  async getState(
    dealId: string,
  ): Promise<{ state: SignoffState; signedBy?: string }> {
    const cur = records().get(dealId);
    if (!cur) return { state: "pending" };
    return cur.signedBy
      ? { state: cur.state, signedBy: cur.signedBy }
      : { state: cur.state };
  }
}

function signoffError(
  message: string,
  code: string,
  status: number,
): Error & { code: string; status: number } {
  const err = new Error(message) as Error & { code: string; status: number };
  err.code = code;
  err.status = status;
  return err;
}

export function getVoiceSignoffService(): VoiceSignoffServiceImpl {
  return singleton(
    "voice:signoffService",
    () => new VoiceSignoffServiceImpl(),
  );
}

/** Test-only. */
export function __resetSignoffStore(): void {
  __resetSingleton("voice:signoff");
}
