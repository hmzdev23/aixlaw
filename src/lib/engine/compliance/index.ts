/**
 * `ComplianceService` registration seam.
 *
 * Real implementation lands with T6 (TrueSight + OSFI + PIPEDA + Law25). Until
 * then we ship a deterministic stub that returns a sensible canned report so
 * T5 (Council) and T3 (UI) can consume the contract without waiting on T6.
 *
 * When T6 arrives, it imports `setComplianceService(realImpl)` once at module
 * load time; everything else changes nothing.
 */

import type {
  ComplianceReport,
  ComplianceService,
  Law25Result,
  OsfiResult,
  PipedaResult,
  TrueSightResult,
} from "@/contracts";

const STUB_OSFI: OsfiResult = {
  triggered: true,
  triggers: [
    "Initech requires uncapped Section 9 (Data) liability — OSFI third-party risk theme",
    "24-hour breach notification window with written follow-up",
    "Audit rights twice per year, 48 hours notice",
    "Cyber insurance minimum CAD $10M",
    "Step-in rights on vendor failure",
  ],
  notes: [
    "These are scenario-derived themes, not a regulatory opinion. T6 will replace with the live engine.",
  ],
};

const STUB_PIPEDA: PipedaResult = {
  triggered: true,
  triggers: [
    "Cross-border data transfer language without explicit consent",
    "Retention windows on Client Data exceed PIPEDA accountability defaults",
  ],
};

const STUB_LAW25: Law25Result = {
  triggered: false,
  triggers: [],
};

const STUB_TRUESIGHT: TrueSightResult = {
  status: "clean",
  claims: [],
};

const STUB_REPORT: ComplianceReport = {
  trueSight: STUB_TRUESIGHT,
  osfi: STUB_OSFI,
  pipeda: STUB_PIPEDA,
  law25: STUB_LAW25,
};

class StubComplianceService implements ComplianceService {
  async checkProposedText(
    text: string,
    locale: "en" | "fr"
  ): Promise<ComplianceReport> {
    // Args reserved for the T6 implementation; intentionally unused here so
    // that the stub returns a deterministic baseline regardless of input.
    void text;
    void locale;
    // Deep copy so callers can't mutate the cached object.
    return JSON.parse(JSON.stringify(STUB_REPORT)) as ComplianceReport;
  }
}

let active: ComplianceService = new StubComplianceService();

export function complianceService(): ComplianceService {
  return active;
}

/**
 * Replace the active ComplianceService. Called once by T6's module bootstrap.
 * Idempotent and process-local. Tests can swap in mocks freely.
 */
export function setComplianceService(impl: ComplianceService): void {
  active = impl;
}

/** Test-only: revert to the stub. */
export function __resetComplianceForTests(): void {
  active = new StubComplianceService();
}
