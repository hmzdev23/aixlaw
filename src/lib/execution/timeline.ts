/**
 * Per-deal timeline pub/sub with a 20-event ring buffer for replay. Server-only.
 *
 * Why: GET /api/execution/stream is an SSE endpoint; if the browser reconnects
 * mid-stream we must replay the events emitted before the reconnect so the
 * Cockpit timeline footer stays consistent. 20 is enough — a happy path emits
 * 5 events and we never want to truncate them.
 *
 * Backing storage: globalThis-pinned (see util/globalSingleton.ts) so this
 * works in `next dev` across separately-compiled route modules.
 */

import type { TimelineEvent } from "@/lib/contracts";
import { singleton } from "@/lib/util/globalSingleton";

const RING_SIZE = 20;

type Subscriber = (event: TimelineEvent) => void;

interface PerDealState {
  events: TimelineEvent[];
  subscribers: Set<Subscriber>;
  /** True once `complete()` has been called — replay-only after this. */
  complete: boolean;
}

interface TimelineState {
  byDeal: Map<string, PerDealState>;
}

function state(): TimelineState {
  return singleton<TimelineState>("execution:timeline", () => ({
    byDeal: new Map<string, PerDealState>(),
  }));
}

function getOrCreate(dealId: string): PerDealState {
  const s = state().byDeal;
  let cur = s.get(dealId);
  if (!cur) {
    cur = { events: [], subscribers: new Set(), complete: false };
    s.set(dealId, cur);
  }
  return cur;
}

export function publishTimelineEvent(
  dealId: string,
  event: TimelineEvent,
): void {
  const s = getOrCreate(dealId);
  s.events.push(event);
  if (s.events.length > RING_SIZE) s.events.splice(0, s.events.length - RING_SIZE);
  for (const sub of Array.from(s.subscribers)) {
    try {
      sub(event);
    } catch {
      // sub functions own their error handling; one bad subscriber must not
      // block the others.
    }
  }
}

export function markTimelineComplete(dealId: string): void {
  const s = getOrCreate(dealId);
  s.complete = true;
  for (const sub of Array.from(s.subscribers)) {
    try {
      sub(SENTINEL_COMPLETE);
    } catch {
      /* ignore */
    }
  }
}

/** Synthetic event used to signal the SSE writer to close. */
export const SENTINEL_COMPLETE: TimelineEvent = {
  step: "notary_queued",
  status: "done",
  detail: "__pipeline_complete__",
};

export function getTimelineSnapshot(dealId: string): {
  events: TimelineEvent[];
  complete: boolean;
} {
  const s = state().byDeal.get(dealId);
  if (!s) return { events: [], complete: false };
  return { events: [...s.events], complete: s.complete };
}

export interface TimelineSubscription {
  /** Most recent events, in order, replayed before live updates begin. */
  replay: TimelineEvent[];
  /** Indicates the pipeline already finished and replay is the full picture. */
  alreadyComplete: boolean;
  /** Removes the subscriber. Idempotent. */
  unsubscribe(): void;
}

export function subscribeToTimeline(
  dealId: string,
  subscriber: Subscriber,
): TimelineSubscription {
  const s = getOrCreate(dealId);
  s.subscribers.add(subscriber);
  return {
    replay: [...s.events],
    alreadyComplete: s.complete,
    unsubscribe(): void {
      s.subscribers.delete(subscriber);
    },
  };
}

/** Test-only. */
export function __resetTimeline(): void {
  state().byDeal.clear();
}
