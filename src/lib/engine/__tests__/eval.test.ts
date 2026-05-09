import { beforeEach, describe, expect, it } from "vitest";
import { evalService, __testInternals as evalInternals } from "../tree/evalService";
import { ghostEngine, __resetGhostCacheForTests } from "../ghost/ghostEngine";
import { __resetTreeCachesForTests } from "../tree/treeEngine";
import { buildDemoSession } from "../_shared/sessionStore";

describe("EvalService", () => {
  beforeEach(() => {
    __resetTreeCachesForTests();
    __resetGhostCacheForTests();
  });

  it("scores root as the canned -2.4", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const score = await evalService.scorePosition(session, ghost, "n_root");
    expect(score).toBeCloseTo(-2.4, 5);
  });

  it("scores brilliant branch around +0.8", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const score = await evalService.scorePosition(session, ghost, "n_a_brilliant");
    expect(score).toBeCloseTo(0.8, 5);
  });

  it("scores blunder branch around -3.5", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const score = await evalService.scorePosition(session, ghost, "n_c_blunder");
    expect(score).toBeCloseTo(-3.5, 5);
  });

  it("clamps to -4..4", () => {
    expect(evalInternals.clamp(99)).toBe(4);
    expect(evalInternals.clamp(-99)).toBe(-4);
    expect(evalInternals.clamp(NaN)).toBe(0);
  });

  it("rejects missing nodeId and unknown nodeId", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    await expect(evalService.scorePosition(session, ghost, "")).rejects.toMatchObject({
      code: "bad_request",
    });
    await expect(
      evalService.scorePosition(session, ghost, "missing_node")
    ).rejects.toMatchObject({ code: "not_found" });
  });
});
