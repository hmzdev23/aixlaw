import { describe, expect, it } from "vitest";
import { runOsfi, OSFI_DISCLAIMER_TEXT } from "../compliance/osfi";

describe("OSFI engine", () => {
  it("does not trigger on plain text", () => {
    const r = runOsfi("Just talking about lunch.");
    expect(r.triggered).toBe(false);
    expect(r.triggers).toEqual([]);
  });

  it("triggers on the real Initech-redlined MSA text (≥ 3 signals)", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const fp = path.join(
      process.cwd(),
      "Example Scenario (Optional)",
      "msa_initech_redlines.md"
    );
    const text = await fs.readFile(fp, "utf8");
    const r = runOsfi(text);
    expect(r.triggered).toBe(true);
    expect(r.triggers.length).toBeGreaterThanOrEqual(3);
    expect(r.notes && r.notes[0]).toMatch(/scenario-derived themes/);
  });

  it("respects a higher minSignals threshold", () => {
    const text = "Vendor must maintain $10,000,000 cyber liability insurance.";
    const baseline = runOsfi(text);
    expect(baseline.triggers.length).toBe(1);
    const stricter = runOsfi(text, { minSignals: 5 });
    expect(stricter.triggered).toBe(false);
  });

  it("exports a stable disclaimer string", () => {
    expect(OSFI_DISCLAIMER_TEXT).toMatch(/not a regulatory opinion/);
  });
});
