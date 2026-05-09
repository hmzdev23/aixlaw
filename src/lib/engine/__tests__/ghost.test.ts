import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetGhostCacheForTests,
  ghostEngine,
  loadCannedGhost,
} from "../ghost/ghostEngine";
import { buildDemoSession } from "../_shared/sessionStore";

describe("GhostEngine (LLM disabled => canned)", () => {
  beforeEach(() => {
    __resetGhostCacheForTests();
  });

  it("returns a profile with the required shape and lists", async () => {
    const session = buildDemoSession("demo");
    const profile = await ghostEngine.generate(session);

    expect(profile.counterpartyId).toBe("initech_procurement");
    expect(profile.displayName).toContain("INITECH");
    expect(profile.elo).toBeGreaterThanOrEqual(1500);
    expect(profile.elo).toBeLessThanOrEqual(2400);
    expect(profile.fightsOn.length).toBeGreaterThanOrEqual(3);
    expect(profile.oftenConcedes.length).toBeGreaterThanOrEqual(3);
    expect(profile.walksWhen.length).toBeGreaterThanOrEqual(3);
    expect(profile.precedentDealIds.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects a session without a dealId", async () => {
    // @ts-expect-error - intentional bad input
    await expect(ghostEngine.generate({})).rejects.toMatchObject({
      code: "bad_request",
    });
  });

  it("caches by counterparty + locale", async () => {
    const session = buildDemoSession("demo");
    const a = await ghostEngine.generate(session);
    const b = await ghostEngine.generate(session);
    expect(a).toBe(b);
  });

  it("refreshFromIssues bumps high-severity issues into fightsOn", async () => {
    const session = buildDemoSession("demo");
    const base = await ghostEngine.generate(session);
    const refreshed = await ghostEngine.refreshFromIssues(session, [
      {
        id: "issue1",
        clauseRef: "10.9 Step-in Rights",
        severity: "high",
        title: "Step-in rights are non-standard",
        detail: "...",
      },
      {
        id: "issue2",
        clauseRef: "4.2 Payment Terms",
        severity: "low",
        title: "Net 60 vs Net 30",
        detail: "...",
      },
    ]);
    expect(
      refreshed.fightsOn.some((f) => f.toLowerCase().includes("step-in"))
    ).toBe(true);
    expect(refreshed.fightsOn.length).toBeGreaterThanOrEqual(base.fightsOn.length);
    expect(refreshed.trainingSummary).toContain("refreshed");
  });

  it("loadCannedGhost is the same shape as generate output", async () => {
    const canned = await loadCannedGhost();
    expect(canned.counterpartyId).toBe("initech_procurement");
  });
});
