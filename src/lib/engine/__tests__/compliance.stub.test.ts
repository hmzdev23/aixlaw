import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetComplianceForTests,
  complianceService,
  setComplianceService,
  stubComplianceService,
} from "../compliance";

/**
 * After T6, the default `complianceService()` is the real implementation.
 * The stub is still exported for tests that explicitly want a deterministic
 * baseline (Council unit tests, Architect runtime regression, etc.).
 */
describe("ComplianceService injection seam (T6 default = real impl)", () => {
  beforeEach(() => {
    __resetComplianceForTests();
  });

  it("returns the canonical four-regime shape", async () => {
    const r = await complianceService().checkProposedText("hello", "en");
    expect(r.osfi).toBeDefined();
    expect(r.pipeda).toBeDefined();
    expect(r.law25).toBeDefined();
    expect(r.trueSight).toBeDefined();
  });

  it("the real impl returns no triggers on plain text", async () => {
    const r = await complianceService().checkProposedText("hello", "en");
    expect(r.osfi.triggered).toBe(false);
    expect(r.pipeda.triggered).toBe(false);
    expect(r.law25.triggered).toBe(false);
  });

  it("setComplianceService(stubComplianceService) restores the deterministic baseline", async () => {
    setComplianceService(stubComplianceService);
    const r = await complianceService().checkProposedText("hello", "en");
    expect(r.osfi.triggered).toBe(true);
  });

  it("__resetComplianceForTests reverts to the real implementation", async () => {
    setComplianceService(stubComplianceService);
    __resetComplianceForTests();
    const r = await complianceService().checkProposedText("hello", "en");
    expect(r.osfi.triggered).toBe(false);
  });
});
