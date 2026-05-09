/**
 * DealSession factory. Server-only.
 *
 * Given an InboundEvent (or just a documentFocus), assemble the DealSession
 * shape that the engine + UI consume. Paths point at the read-only Spellbook
 * fixture pack — DEMO_FIXTURES.md §1.
 */

import type {
  ContractDocument,
  DealSession,
  InboundDocumentFocus,
  Locale,
} from "@/lib/contracts";
import { setSession } from "@/lib/engine/_shared/sessionStore";
import { FIXTURE_PATHS } from "@/lib/util/fixturePath";

const VENDOR_ID = "dunder_ai" as const;
const COUNTERPARTY_ID = "initech_procurement" as const;

const NDA_DOC: ContractDocument = {
  id: "doc_nda",
  type: "nda",
  label: "NDA — Dunder AI ↔ Initech",
  originalRef: FIXTURE_PATHS.ndaOriginal,
  redlinedRef: FIXTURE_PATHS.ndaRedlined,
};

const MSA_DOC: ContractDocument = {
  id: "doc_msa",
  type: "msa",
  label: "MSA — Dunder AI / Initech (v2 redlined)",
  originalRef: FIXTURE_PATHS.msaOriginal,
  redlinedRef: FIXTURE_PATHS.msaRedlined,
};

export interface BuildDealSessionInput {
  dealId: string;
  documentFocus: InboundDocumentFocus | undefined;
  locale?: Locale;
}

export function buildDealSession(input: BuildDealSessionInput): DealSession {
  const focus: InboundDocumentFocus = input.documentFocus ?? "msa";
  const activeId = focus === "nda" ? NDA_DOC.id : MSA_DOC.id;
  const session: DealSession = {
    dealId: input.dealId,
    vendorId: VENDOR_ID,
    counterpartyId: COUNTERPARTY_ID,
    documents: [NDA_DOC, MSA_DOC],
    // T4 (Aditya) writes synthetic precedent JSON under
    // "Example Scenario (Optional)/precedents/". We stub the keys here so
    // the engine has stable references to look up.
    precedentRefs: ["initech_vendor_a", "initech_vendor_b", "initech_vendor_c"],
    locale: input.locale ?? "en",
    activeDocumentId: activeId,
  };
  // Canonical engine session registry (T4–T9) — keep in sync with inbound.
  setSession(session);
  return session;
}
