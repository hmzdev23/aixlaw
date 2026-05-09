import type { CouncilResult } from "@/contracts";

/**
 * In-process store of the most recent CouncilResult per (dealId, moveId).
 * Used by the audit badge in the War Room and the Architect runtime.
 *
 * Hackathon-grade: process-local. Replace with KV in production.
 */

const last = new Map<string, CouncilResult>();

function key(dealId: string, moveId: string): string {
  return `${dealId}::${moveId}`;
}

export function rememberCouncilResult(dealId: string, result: CouncilResult): void {
  last.set(key(dealId, result.moveId), result);
}

export function getLastCouncilResult(
  dealId: string,
  moveId: string
): CouncilResult | undefined {
  return last.get(key(dealId, moveId));
}

export function __resetCouncilStoreForTests(): void {
  last.clear();
}
