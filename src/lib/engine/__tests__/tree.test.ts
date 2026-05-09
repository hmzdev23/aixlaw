import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetTreeCachesForTests,
  loadCannedTree,
  treeEngine,
  __testInternals as treeInternals,
} from "../tree/treeEngine";
import { ghostEngine, __resetGhostCacheForTests } from "../ghost/ghostEngine";
import { buildDemoSession } from "../_shared/sessionStore";

describe("TreeEngine (LLM disabled => canned)", () => {
  beforeEach(() => {
    __resetTreeCachesForTests();
    __resetGhostCacheForTests();
  });

  it("returns exactly 3 primary branches in !! / ?! / ?? order", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const tree = await treeEngine.bloom(session, ghost);

    expect(tree.primaryBranchIds.length).toBe(3);
    const notations = tree.primaryBranchIds.map(
      (id) => tree.nodes[id].move?.notation
    );
    expect(notations).toEqual(["!!", "?!", "??"]);
  });

  it("eval score is the demo lock -2.4", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const tree = await treeEngine.bloom(session, ghost);
    expect(tree.evalScore).toBeCloseTo(-2.4, 5);
  });

  it("predictCounterMove returns canned text for known node ids", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const text = await treeEngine.predictCounterMove(
      "n_a_brilliant",
      session,
      ghost
    );
    expect(text.length).toBeGreaterThan(20);
  });

  it("predictCounterMove rejects unknown node ids", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    await expect(
      treeEngine.predictCounterMove("does_not_exist", session, ghost)
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("enforceInvariants clamps probabilities and fixes monotonicity", () => {
    const broken = {
      rootId: "r",
      primaryBranchIds: ["a", "b", "c"] as [string, string, string],
      evalScore: 10, // out of range
      nodes: {
        r: { id: "r", parentId: null, childrenIds: [] },
        a: {
          id: "a",
          parentId: "r",
          childrenIds: [],
          move: {
            id: "a",
            label: "Brilliant move",
            notation: "??" as const, // wrong notation; should be coerced
            summary: "...",
            closeProbability: 0.2, // below "risky"; should be swapped
            retainedValueCad: 100,
          },
        },
        b: {
          id: "b",
          parentId: "r",
          childrenIds: [],
          move: {
            id: "b",
            label: "Risky move",
            notation: "!!" as const, // wrong notation
            summary: "...",
            closeProbability: 1.5, // out of range
            retainedValueCad: 100,
          },
        },
        c: {
          id: "c",
          parentId: "r",
          childrenIds: [],
          move: {
            id: "c",
            label: "Blunder move",
            notation: "!!" as const, // wrong
            summary: "...",
            closeProbability: 0.05,
            retainedValueCad: -1000,
          },
        },
      },
    };

    const fixed = treeInternals.enforceInvariants(broken);
    expect(fixed.evalScore).toBe(4); // clamped
    expect(fixed.nodes.a.move?.notation).toBe("!!");
    expect(fixed.nodes.b.move?.notation).toBe("?!");
    expect(fixed.nodes.c.move?.notation).toBe("??");
    expect(fixed.nodes.b.move?.closeProbability).toBeLessThanOrEqual(1);
    expect(fixed.nodes.a.move?.closeProbability).toBeGreaterThanOrEqual(
      fixed.nodes.b.move!.closeProbability
    );
    expect(fixed.nodes.c.move?.closeProbability).toBeGreaterThanOrEqual(
      fixed.nodes.a.move!.closeProbability
    );
    expect(fixed.nodes.r.childrenIds).toEqual(["a", "b", "c"]);
  });

  it("loadCannedTree is schema-valid", async () => {
    const t = await loadCannedTree();
    expect(t.primaryBranchIds.length).toBe(3);
  });
});
