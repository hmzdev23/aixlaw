import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  __resetPlaybookStorageForTests,
  playbookRepository,
} from "../architect/repository";
import {
  architectRuntime,
  __testInternals as runtimeInternals,
} from "../architect/runtime";
import { ensureCannedDecisionLoaded } from "../architect/_cannedDecision";
import { buildDemoSession } from "../_shared/sessionStore";

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "gambit-pb-"));
  process.env.GAMBIT_PLAYBOOKS_DIR = tmpDir;
  __resetPlaybookStorageForTests();
});

afterAll(async () => {
  delete process.env.GAMBIT_PLAYBOOKS_DIR;
  __resetPlaybookStorageForTests();
  await rm(tmpDir, { recursive: true, force: true });
});

beforeEach(() => {
  __resetPlaybookStorageForTests();
});

describe("PlaybookRepository", () => {
  it("loads the default playbook from fixtures by default", async () => {
    const def = await playbookRepository.get("pb_default");
    expect(def.id).toBe("pb_default");
    expect(def.blocks.length).toBeGreaterThan(5);
    const summaries = await playbookRepository.list();
    expect(summaries.find((s) => s.id === "pb_default")).toBeDefined();
  });

  it("rejects an invalid playbook on save", async () => {
    await expect(
      playbookRepository.save({
        id: "",
        name: "broken",
        version: "1.0.0",
        blocks: [],
        edges: [],
        createdBy: "test",
        updatedAt: new Date().toISOString(),
      })
    ).rejects.toMatchObject({ code: "validation_failed" });
  });

  it("round-trips a saved playbook", async () => {
    const pb = {
      id: "pb_test_round",
      name: "Round-trip playbook",
      version: "1.0.0",
      createdBy: "test",
      updatedAt: new Date().toISOString(),
      blocks: [
        { id: "b1", type: "ghost" as const, position: { x: 0, y: 0 }, params: {} },
        { id: "b2", type: "tree" as const, position: { x: 100, y: 0 }, params: {} },
      ],
      edges: [{ id: "e1", source: "b1", target: "b2" }],
    };
    await playbookRepository.save(pb);
    const back = await playbookRepository.get("pb_test_round");
    expect(back.id).toBe("pb_test_round");
    expect(back.blocks.map((b) => b.id).sort()).toEqual(["b1", "b2"]);
  });

  it("404s on unknown id", async () => {
    await expect(playbookRepository.get("nope")).rejects.toMatchObject({
      code: "not_found",
    });
  });
});

describe("topoSort", () => {
  it("orders by dependency", () => {
    const ordered = runtimeInternals.topoSort({
      id: "p",
      name: "p",
      version: "1",
      createdBy: "t",
      updatedAt: "now",
      blocks: [
        { id: "b", type: "tree", position: { x: 0, y: 0 }, params: {} },
        { id: "a", type: "ghost", position: { x: 0, y: 0 }, params: {} },
      ],
      edges: [{ id: "e", source: "a", target: "b" }],
    });
    expect(ordered.map((b) => b.id)).toEqual(["a", "b"]);
  });

  it("rejects cycles", () => {
    expect(() =>
      runtimeInternals.topoSort({
        id: "p",
        name: "p",
        version: "1",
        createdBy: "t",
        updatedAt: "now",
        blocks: [
          { id: "a", type: "ghost", position: { x: 0, y: 0 }, params: {} },
          { id: "b", type: "tree", position: { x: 0, y: 0 }, params: {} },
        ],
        edges: [
          { id: "e1", source: "a", target: "b" },
          { id: "e2", source: "b", target: "a" },
        ],
      })
    ).toThrowError(/cycle/i);
  });

  it("rejects unknown edge endpoints", () => {
    expect(() =>
      runtimeInternals.topoSort({
        id: "p",
        name: "p",
        version: "1",
        createdBy: "t",
        updatedAt: "now",
        blocks: [{ id: "a", type: "ghost", position: { x: 0, y: 0 }, params: {} }],
        edges: [{ id: "e", source: "a", target: "nope" }],
      })
    ).toThrowError(/unknown block/i);
  });
});

describe("ArchitectRuntime.execute (canned-mode)", () => {
  beforeEach(async () => {
    await ensureCannedDecisionLoaded();
  });

  it("produces a Decision from the default playbook", async () => {
    const def = await playbookRepository.get("pb_default");
    const session = buildDemoSession("demo");
    const decision = await architectRuntime.execute(def, session);
    expect(decision.dealId).toBe("demo");
    expect(decision.financials.currency).toBe("CAD");
    expect(decision.financials.totalContractCad).toBe(180000);
    expect(decision.complianceFlags.length).toBeGreaterThan(0);
    expect(decision.chosenMoveId).toMatch(/^n_/);
  });

  it("rejects an empty playbook", async () => {
    await expect(
      architectRuntime.execute(
        {
          id: "p",
          name: "p",
          version: "1",
          createdBy: "t",
          updatedAt: "now",
          blocks: [],
          edges: [],
        },
        buildDemoSession("demo")
      )
    ).rejects.toMatchObject({ code: "bad_request" });
  });
});
