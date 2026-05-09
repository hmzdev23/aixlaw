/**
 * In-memory Decision store. Server-only.
 *
 * Idempotency: keyed by `${dealId}::${chosenMoveId}`. POST /api/workproduct/decision
 * with the same key returns the previously-stored Decision instead of duplicating
 * downstream side-effects.
 *
 * Backed by globalThis (see util/globalSingleton.ts) so dev + prod share state.
 */

import type { Decision } from "@/lib/contracts";
import { singleton, __resetSingleton } from "@/lib/util/globalSingleton";

interface StoredDecision {
  decision: Decision;
  storedAt: string;
  /** Cached generated artifacts so re-fetches are instant. */
  cache: {
    counterDocx?: Uint8Array;
    supervisorPdfLegal?: Uint8Array;
    supervisorPdfPlain?: Uint8Array;
  };
}

function store(): Map<string, StoredDecision> {
  return singleton<Map<string, StoredDecision>>(
    "workproduct:decisions",
    () => new Map<string, StoredDecision>(),
  );
}

function idemKey(dealId: string, chosenMoveId: string): string {
  return `${dealId}::${chosenMoveId}`;
}

export function rememberDecision(decision: Decision): {
  duplicate: boolean;
  stored: StoredDecision;
} {
  const byDeal = store();
  const existing = byDeal.get(decision.dealId);
  if (
    existing &&
    idemKey(existing.decision.dealId, existing.decision.chosenMoveId) ===
      idemKey(decision.dealId, decision.chosenMoveId)
  ) {
    return { duplicate: true, stored: existing };
  }
  const next: StoredDecision = {
    decision,
    storedAt: new Date().toISOString(),
    cache: {},
  };
  byDeal.set(decision.dealId, next);
  return { duplicate: false, stored: next };
}

export function getStoredDecision(dealId: string): StoredDecision | undefined {
  return store().get(dealId);
}

export function getDecision(dealId: string): Decision | undefined {
  return store().get(dealId)?.decision;
}

export function cacheCounterDocx(dealId: string, bytes: Uint8Array): void {
  const s = store().get(dealId);
  if (s) s.cache.counterDocx = bytes;
}

export function cacheSupervisorPdf(
  dealId: string,
  mode: "legal" | "plain",
  bytes: Uint8Array,
): void {
  const s = store().get(dealId);
  if (!s) return;
  if (mode === "legal") s.cache.supervisorPdfLegal = bytes;
  else s.cache.supervisorPdfPlain = bytes;
}

export function __resetDecisionStore(): void {
  __resetSingleton("workproduct:decisions");
}
