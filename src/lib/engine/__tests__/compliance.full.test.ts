import { beforeEach, describe, expect, it } from "vitest";
import { realComplianceService } from "../compliance/complianceService";
import {
  __resetComplianceForTests,
  complianceService,
} from "../compliance";
import { __resetCanliiForTests } from "../compliance/canliiClient";
import { __resetPiaForTests } from "../compliance/piaGenerator";
import { __resetTrueSightForTests } from "../compliance/trueSight";

describe("RealComplianceService end-to-end (real Initech MSA text)", () => {
  beforeEach(() => {
    __resetCanliiForTests();
    __resetTrueSightForTests();
    __resetPiaForTests();
    __resetComplianceForTests();
    process.env.GAMBIT_DISABLE_CANLII = "true";
    delete process.env.GOOGLE_CLOUD_TRANSLATION_KEY;
  });

  it("the default exported service is the real T6 implementation", async () => {
    // Sanity: T5 callers pick up the real impl now.
    const r = await complianceService().checkProposedText("plain", "en");
    // Real impl on plain text => no triggers.
    expect(r.osfi.triggered).toBe(false);
    expect(r.pipeda.triggered).toBe(false);
  });

  it("returns the canonical 4-key shape", async () => {
    const r = await realComplianceService.checkProposedText("plain text", "en");
    expect(Object.keys(r).sort()).toEqual(["law25", "osfi", "pipeda", "trueSight"]);
  });

  it("on the real Initech MSA: OSFI + PIPEDA both trigger; Law 25 does not", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const fp = path.join(
      process.cwd(),
      "Example Scenario (Optional)",
      "msa_initech_redlines.md"
    );
    const text = await fs.readFile(fp, "utf8");
    const r = await realComplianceService.checkProposedText(text, "en");
    expect(r.osfi.triggered).toBe(true);
    expect(r.osfi.triggers.length).toBeGreaterThanOrEqual(3);
    expect(r.pipeda.triggered).toBe(true);
    expect(r.law25.triggered).toBe(false);
  });

  it("demo dealId path: TrueSight substitutes the canned bad citation", async () => {
    const text =
      "Per the holding in Beaulieu v. Provincial Insurance, 2021 QCCA 412, this clause is unenforceable.";
    const r = await realComplianceService.checkProposedTextEx(text, "en", {
      dealId: "demo",
    });
    expect(r.trueSight.status).toBe("substituted");
    expect(r._extracted?.length).toBeGreaterThan(0);
  });

  it("notary-style forceLaw25 path produces an EN+FR PIA", async () => {
    const r = await realComplianceService.checkProposedTextEx(
      "Vendor performs cross-border data transfers to U.S.-based subprocessors.",
      "en",
      { forceLaw25: true, piaTokens: { vendor_displayName: "Dunder AI" } }
    );
    expect(r.law25.triggered).toBe(true);
    expect(r.law25.pia).toBeDefined();
    expect(r.law25.pia!.sectionsEn.demo_notice).toMatch(/Demo extension/i);
    expect(r.law25.pia!.sectionsFr.demo_notice).toMatch(/Extension de démonstration/i);
  });
});
