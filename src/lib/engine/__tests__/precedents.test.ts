import { describe, expect, it } from "vitest";
import {
  __resetPrecedentCacheForTests,
  loadPrecedents,
} from "../_shared/precedents";

describe("precedents", () => {
  it("loads the three default Initech vendor packs", async () => {
    __resetPrecedentCacheForTests();
    const packs = await loadPrecedents();
    expect(packs.length).toBe(3);
    expect(packs.map((p) => p.id).sort()).toEqual([
      "initech_vendor_a",
      "initech_vendor_b",
      "initech_vendor_c",
    ]);
    for (const p of packs) {
      expect(p.clauses.length).toBeGreaterThanOrEqual(3);
      for (const c of p.clauses) {
        expect(c.text.length).toBeGreaterThan(20);
      }
    }
  });

  it("caches subsequent calls", async () => {
    __resetPrecedentCacheForTests();
    const a = await loadPrecedents();
    const b = await loadPrecedents();
    expect(a).toBe(b);
  });

  it("rejects a missing file", async () => {
    __resetPrecedentCacheForTests();
    await expect(
      loadPrecedents(["does_not_exist.json"])
    ).rejects.toMatchObject({ code: "fixture_missing" });
  });
});
