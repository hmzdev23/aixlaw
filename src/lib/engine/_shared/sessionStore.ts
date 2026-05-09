import type { ContractDocument, DealSession } from "@/contracts";
import { FIXTURE_DIR } from "@/contracts";
import { EngineError } from "./errors";

/**
 * In-process DealSession registry.
 *
 * Hackathon-grade: a single seeded "demo" deal that maps to the Spellbook
 * Dunder/Initech fixture pack. Will (T7) will replace `getOrCreateDemoSession`
 * with a real inbound flow but keep the same shape.
 */

const sessions = new Map<string, DealSession>();

const DEMO_DOCUMENTS: ContractDocument[] = [
  {
    id: "doc_msa",
    type: "msa",
    label: "Master Service Agreement",
    originalRef: `${FIXTURE_DIR}/msa_dunder_original.md`,
    redlinedRef: `${FIXTURE_DIR}/msa_initech_redlines.md`,
  },
  {
    id: "doc_nda",
    type: "nda",
    label: "Mutual NDA",
    originalRef: `${FIXTURE_DIR}/nda_dunder_original.md`,
    redlinedRef: `${FIXTURE_DIR}/nda_initech_redlines.md`,
  },
];

const DEMO_PRECEDENTS = [
  "initech_vendor_a",
  "initech_vendor_b",
  "initech_vendor_c",
];

export function buildDemoSession(dealId = "demo"): DealSession {
  return {
    dealId,
    vendorId: "dunder_ai",
    counterpartyId: "initech_procurement",
    documents: DEMO_DOCUMENTS,
    precedentRefs: DEMO_PRECEDENTS,
    locale: "en",
    activeDocumentId: "doc_msa",
  };
}

export function getOrCreateDemoSession(dealId = "demo"): DealSession {
  const existing = sessions.get(dealId);
  if (existing) return existing;
  const created = buildDemoSession(dealId);
  sessions.set(dealId, created);
  return created;
}

export function getSession(dealId: string): DealSession {
  if (dealId === "demo") return getOrCreateDemoSession(dealId);
  const found = sessions.get(dealId);
  if (!found) {
    throw new EngineError({
      code: "not_found",
      message: `Unknown dealId: ${dealId}`,
    });
  }
  return found;
}

export function setSession(session: DealSession): void {
  sessions.set(session.dealId, session);
}

/** Test only. */
export function __resetSessionsForTests(): void {
  sessions.clear();
}
