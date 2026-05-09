/**
 * In-memory inbound event store. Server-only.
 *
 * Backed by a globalThis-pinned singleton (see util/globalSingleton.ts) so
 * `next dev` and `next start` behave identically across API routes.
 */

import type { InboundEvent } from "@/lib/contracts";
import { singleton, __resetSingleton } from "@/lib/util/globalSingleton";

interface InboundState {
  byDeal: Map<string, InboundEvent>;
  latest: InboundEvent | null;
}

function state(): InboundState {
  return singleton<InboundState>("inbound:state", () => ({
    byDeal: new Map<string, InboundEvent>(),
    latest: null,
  }));
}

export function rememberInboundEvent(event: InboundEvent): void {
  const s = state();
  s.byDeal.set(event.dealId, event);
  s.latest = event;
}

export function getInboundEvent(dealId: string): InboundEvent | undefined {
  return state().byDeal.get(dealId);
}

export function getLatestInboundEvent(): InboundEvent | null {
  return state().latest;
}

export function listInboundEvents(): InboundEvent[] {
  return Array.from(state().byDeal.values()).sort((a, b) =>
    a.receivedAt < b.receivedAt ? 1 : -1,
  );
}

export function __resetInboundStore(): void {
  __resetSingleton("inbound:state");
}
