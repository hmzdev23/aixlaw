import { describe, expect, it } from "vitest";
import { runPipeda } from "../compliance/pipeda";

describe("PIPEDA engine", () => {
  it("does not trigger on plain text", () => {
    const r = runPipeda("Plain prose with nothing relevant.");
    expect(r.triggered).toBe(false);
  });

  it("triggers on a single cross-border signal", () => {
    const r = runPipeda(
      "Vendor may transfer Client Data to U.S.-based subprocessors with notice."
    );
    expect(r.triggered).toBe(true);
    expect(
      r.triggers.some((t) => t.toLowerCase().includes("cross-border"))
    ).toBe(true);
  });

  it("triggers on the real Initech MSA text (≥ 1 signal, typically several)", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const fp = path.join(
      process.cwd(),
      "Example Scenario (Optional)",
      "msa_initech_redlines.md"
    );
    const text = await fs.readFile(fp, "utf8");
    const r = runPipeda(text);
    expect(r.triggered).toBe(true);
    expect(r.triggers.length).toBeGreaterThanOrEqual(1);
  });
});
