import { describe, expect, it } from "vitest";
import { runLaw25, LAW25_DEMO_NOTICE } from "../compliance/law25";
import { __resetPiaForTests } from "../compliance/piaGenerator";

describe("Law25 + PIA", () => {
  it("does not trigger on plain text", async () => {
    __resetPiaForTests();
    const r = await runLaw25("Plain MSA prose with no Quebec / subprocessor signals.");
    expect(r.triggered).toBe(false);
    expect(r.triggers).toEqual([]);
  });

  it("does not trigger on Quebec-only text without subprocessor", async () => {
    const r = await runLaw25("This MSA mentions Quebec branches and Quebec residents.");
    expect(r.triggered).toBe(false);
  });

  it("triggers when both Quebec and US-subprocessor signals are present", async () => {
    __resetPiaForTests();
    const text =
      "Vendor uses a US-hosted analytics subprocessor that processes Quebec-resident customer data.";
    const r = await runLaw25(text, {
      templateTokens: { vendor_displayName: "Dunder AI", counterparty_displayName: "Initech" },
    });
    expect(r.triggered).toBe(true);
    expect(r.triggers[0]).toBe(LAW25_DEMO_NOTICE);
    expect(r.pia).toBeDefined();
    expect(r.pia!.sectionsEn.transfers).toMatch(/cross-border/i);
    expect(r.pia!.sectionsFr.transfers).toMatch(/transfrontalier/i);
  });

  it("forceTrigger always fires, even on plain input", async () => {
    __resetPiaForTests();
    const r = await runLaw25("nothing relevant", { forceTrigger: true });
    expect(r.triggered).toBe(true);
    expect(r.triggers.some((t) => t.startsWith("DEMO EXTENSION"))).toBe(true);
  });

  it("can suppress PIA generation via opts.generatePia=false", async () => {
    __resetPiaForTests();
    const r = await runLaw25("Quebec + US-hosted analytics subprocessor.", {
      generatePia: false,
    });
    expect(r.triggered).toBe(true);
    expect(r.pia).toBeUndefined();
  });
});
