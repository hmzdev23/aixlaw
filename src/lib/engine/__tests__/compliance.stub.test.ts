import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetComplianceForTests,
  complianceService,
  setComplianceService,
} from "../compliance";

describe("ComplianceService stub + injection seam", () => {
  beforeEach(() => {
    __resetComplianceForTests();
  });

  it("returns the canonical four-regime shape", async () => {
    const r = await complianceService().checkProposedText("hello", "en");
    expect(r.osfi).toBeDefined();
    expect(r.pipeda).toBeDefined();
    expect(r.law25).toBeDefined();
    expect(r.trueSight).toBeDefined();
    expect(r.osfi.triggered).toBe(true);
  });

  it("setComplianceService swaps the implementation", async () => {
    setComplianceService({
      async checkProposedText() {
        return {
          osfi: { triggered: false, triggers: [] },
          pipeda: { triggered: false, triggers: [] },
          law25: { triggered: false, triggers: [] },
          trueSight: { status: "clean", claims: [] },
        };
      },
    });
    const r = await complianceService().checkProposedText("hello", "en");
    expect(r.osfi.triggered).toBe(false);
  });

  it("__resetComplianceForTests reverts to the stub", async () => {
    setComplianceService({
      async checkProposedText() {
        return {
          osfi: { triggered: false, triggers: [] },
          pipeda: { triggered: false, triggers: [] },
          law25: { triggered: false, triggers: [] },
          trueSight: { status: "clean", claims: [] },
        };
      },
    });
    __resetComplianceForTests();
    const r = await complianceService().checkProposedText("hello", "en");
    expect(r.osfi.triggered).toBe(true);
  });
});
