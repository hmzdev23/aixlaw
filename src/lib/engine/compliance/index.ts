/**
 * `ComplianceService` registration seam.
 *
 * Lifecycle:
 *   - Sprint 0 / T5: a deterministic stub was the default so Council/Architect
 *     could ship without waiting on T6.
 *   - T6 (this branch): the real implementation in `./complianceService.ts` is
 *     registered as the default. T5 callers (`complianceService()`) get the
 *     real engine with **no call-site changes**.
 *   - Tests can still inject a custom impl via `setComplianceService(impl)`
 *     and revert via `__resetComplianceForTests()`.
 *
 * If you need the deterministic stub explicitly (e.g. a test that wants to
 * isolate Council behaviour from compliance signals), call
 * `setComplianceService(stubComplianceService)` directly.
 */

import type {
  ComplianceReport,
  ComplianceService,
  Law25Result,
  OsfiResult,
  PipedaResult,
  TrueSightResult,
} from "@/contracts";
import { realComplianceService } from "./complianceService";

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
    "Stub baseline — used only when explicitly registered via setComplianceService(stubComplianceService).",
  ],
};
const STUB_PIPEDA: PipedaResult = {
  triggered: true,
  triggers: [
    "Cross-border data transfer language without explicit consent",
    "Retention windows on Client Data exceed PIPEDA accountability defaults",
  ],
};
const STUB_LAW25: Law25Result = { triggered: false, triggers: [] };
const STUB_TRUESIGHT: TrueSightResult = { status: "clean", claims: [] };
const STUB_REPORT: ComplianceReport = {
  trueSight: STUB_TRUESIGHT,
  osfi: STUB_OSFI,
  pipeda: STUB_PIPEDA,
  law25: STUB_LAW25,
};

export const stubComplianceService: ComplianceService = {
  async checkProposedText(text, locale) {
    void text;
    void locale;
    return JSON.parse(JSON.stringify(STUB_REPORT)) as ComplianceReport;
  },
};

let active: ComplianceService = realComplianceService;

export function complianceService(): ComplianceService {
  return active;
}

/**
 * Replace the active ComplianceService. Module-local & idempotent. Tests can
 * pass `stubComplianceService` here when they want the deterministic baseline.
 */
export function setComplianceService(impl: ComplianceService): void {
  active = impl;
}

/** Test-only: revert to the real T6 implementation. */
export function __resetComplianceForTests(): void {
  active = realComplianceService;
}
