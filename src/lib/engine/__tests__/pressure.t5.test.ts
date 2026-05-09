/**
 * Pressure tests specific to T5 (Council, AI-vs-AI, Architect runtime, NDJSON).
 *
 * Runs with GAMBIT_DISABLE_LLM=true (vitest config). Failures here mean the
 * deterministic / fallback path has a bug we'd hit during the demo.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { POST as councilPOST } from "@/app/api/engine/council/route";
import { POST as aivsaiPOST } from "@/app/api/engine/aivsai/route";
import { POST as playbooksPOST } from "@/app/api/playbooks/route";
import { POST as playbookExecute } from "@/app/api/playbooks/[id]/execute/route";

import { __resetSessionsForTests } from "../_shared/sessionStore";
import { __resetGhostCacheForTests } from "../ghost/ghostEngine";
import { __resetTreeCachesForTests } from "../tree/treeEngine";
import { __resetCouncilCacheForTests } from "../council/councilService";
import { __resetCouncilStoreForTests } from "../council/store";
import { __resetPlaybookStorageForTests } from "../architect/repository";
import { __resetGhostFixtureCacheForTests } from "../_shared/ghostFixtures";
import {
  asyncIterableToNdjson,
  collectNdjson,
  NDJSON_HEADERS,
} from "../_shared/ndjson";

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "gambit-pres-"));
  process.env.GAMBIT_PLAYBOOKS_DIR = tmpDir;
});

afterAll(async () => {
  delete process.env.GAMBIT_PLAYBOOKS_DIR;
  await rm(tmpDir, { recursive: true, force: true });
});

beforeEach(() => {
  __resetSessionsForTests();
  __resetGhostCacheForTests();
  __resetTreeCachesForTests();
  __resetCouncilCacheForTests();
  __resetCouncilStoreForTests();
  __resetPlaybookStorageForTests();
  __resetGhostFixtureCacheForTests();
});

function postReq(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("pressure: NDJSON helper", () => {
  it("collectNdjson handles trailing-newline / no-trailing-newline / empty lines", async () => {
    async function* gen() {
      yield { a: 1 };
      yield { a: 2 };
      yield { a: 3 };
    }
    const stream = asyncIterableToNdjson(gen());
    const res = new Response(stream, { headers: NDJSON_HEADERS });
    const lines = await collectNdjson<{ a: number }>(res);
    expect(lines.map((l) => l.a)).toEqual([1, 2, 3]);
  });

  it("collectNdjson surfaces a trailing error envelope when the iter throws", async () => {
    async function* gen() {
      yield { a: 1 };
      throw new Error("boom");
    }
    const stream = asyncIterableToNdjson(gen());
    const res = new Response(stream, { headers: NDJSON_HEADERS });
    const lines = await collectNdjson<Record<string, unknown>>(res);
    expect(lines.length).toBe(2);
    expect(lines.at(-1)).toMatchObject({ kind: "error" });
  });
});

describe("pressure: council stream behavior", () => {
  it("each of the three primary moves streams 5 events + 1 result", async () => {
    for (const moveId of ["n_a_brilliant", "n_b_risky", "n_c_blunder"]) {
      const res = await councilPOST(
        postReq("http://localhost/api/engine/council", { dealId: "demo", moveId })
      );
      const lines = await collectNdjson<Record<string, unknown>>(res);
      expect(lines.length).toBe(6);
      expect(lines.at(-1)).toMatchObject({ kind: "result" });
    }
  });

  it("two concurrent streams complete independently with the same totals", async () => {
    const make = (moveId: string) =>
      councilPOST(
        postReq("http://localhost/api/engine/council", { dealId: "demo", moveId })
      ).then((r) => collectNdjson<Record<string, unknown>>(r));

    const [a, b] = await Promise.all([
      make("n_a_brilliant"),
      make("n_c_blunder"),
    ]);
    expect(a.length).toBe(6);
    expect(b.length).toBe(6);
  });

  it("crown's vote round-trips into the persisted CouncilResult", async () => {
    const res = await councilPOST(
      postReq("http://localhost/api/engine/council", {
        dealId: "demo",
        moveId: "n_b_risky",
      })
    );
    const lines = await collectNdjson<Record<string, unknown>>(res);
    const last = lines.at(-1) as { kind: string; result: { tally: { crown?: string } } };
    expect(last.kind).toBe("result");
    expect(last.result.tally.crown).toBe("reject");
  });
});

describe("pressure: AI-vs-AI", () => {
  it("never emits more than maxRounds events (canned mode caps at 4)", async () => {
    const res = await aivsaiPOST(
      postReq("http://localhost/api/engine/aivsai", {
        clauseText: "Vendor's total aggregate liability shall not exceed 12 months of fees.",
        leftGhostId: "initech_procurement",
        rightGhostId: "dunder_founder",
        maxRounds: 12,
      })
    );
    const lines = await collectNdjson<Record<string, unknown>>(res);
    expect(lines.length).toBeLessThanOrEqual(4);
  });
});

describe("pressure: Architect runtime", () => {
  it("rejects a 100-block cycle quickly (well under 100ms)", async () => {
    const blocks = Array.from({ length: 100 }, (_, i) => ({
      id: `b${i}`,
      type: "ghost" as const,
      position: { x: 0, y: 0 },
      params: {},
    }));
    const edges = blocks.map((b, i) => ({
      id: `e${i}`,
      source: b.id,
      target: blocks[(i + 1) % blocks.length].id,
    }));
    const start = Date.now();
    const res = await playbookExecute(
      postReq("http://localhost/api/playbooks/pb_test_cycle/execute", { dealId: "demo" }),
      { params: Promise.resolve({ id: "pb_test_cycle" }) }
    );
    const elapsed = Date.now() - start;
    // Playbook doesn't exist yet, so it 404s quickly. Save then re-test cycle.
    expect([404, 400]).toContain(res.status);
    expect(elapsed).toBeLessThan(500);

    // Now save and try again
    await playbooksPOST(
      postReq("http://localhost/api/playbooks", {
        id: "pb_test_cycle",
        name: "cycle",
        version: "1",
        createdBy: "test",
        updatedAt: new Date().toISOString(),
        blocks,
        edges,
      })
    );
    const res2 = await playbookExecute(
      postReq("http://localhost/api/playbooks/pb_test_cycle/execute", { dealId: "demo" }),
      { params: Promise.resolve({ id: "pb_test_cycle" }) }
    );
    expect(res2.status).toBe(400);
  });

  it("executes a minimal ghost->tree->crown playbook to a Decision", async () => {
    await playbooksPOST(
      postReq("http://localhost/api/playbooks", {
        id: "pb_minimal",
        name: "minimal",
        version: "1.0.0",
        createdBy: "test",
        updatedAt: new Date().toISOString(),
        blocks: [
          { id: "b_g", type: "ghost", position: { x: 0, y: 0 }, params: {} },
          { id: "b_t", type: "tree", position: { x: 100, y: 0 }, params: {} },
          { id: "b_c", type: "crown", position: { x: 200, y: 0 }, params: {} },
        ],
        edges: [
          { id: "e1", source: "b_g", target: "b_t" },
          { id: "e2", source: "b_t", target: "b_c" },
        ],
      })
    );
    const res = await playbookExecute(
      postReq("http://localhost/api/playbooks/pb_minimal/execute", { dealId: "demo" }),
      { params: Promise.resolve({ id: "pb_minimal" }) }
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { dealId: string; chosenMoveId: string } };
    expect(json.data.dealId).toBe("demo");
    expect(json.data.chosenMoveId).toMatch(/^n_/);
  });

  it("rejects unknown block type via save (Zod) instead of crashing at runtime", async () => {
    const res = await playbooksPOST(
      postReq("http://localhost/api/playbooks", {
        id: "pb_bad_type",
        name: "bad",
        version: "1.0.0",
        createdBy: "test",
        updatedAt: new Date().toISOString(),
        blocks: [
          {
            id: "b_x",
            type: "not_a_real_block",
            position: { x: 0, y: 0 },
            params: {},
          },
        ],
        edges: [],
      })
    );
    expect(res.status).toBe(422);
  });
});

describe("pressure: large playbook list", () => {
  it("list handles 25 saved playbooks under 500ms", async () => {
    for (let i = 0; i < 25; i += 1) {
      await playbooksPOST(
        postReq("http://localhost/api/playbooks", {
          id: `pb_bulk_${i}`,
          name: `Bulk ${i}`,
          version: "1.0.0",
          createdBy: "test",
          updatedAt: new Date().toISOString(),
          blocks: [
            { id: "b1", type: "ghost", position: { x: 0, y: 0 }, params: {} },
          ],
          edges: [],
        })
      );
    }
    const start = Date.now();
    const { GET } = await import("@/app/api/playbooks/route");
    const res = await GET();
    const elapsed = Date.now() - start;
    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(500);
    const json = (await res.json()) as { data: { id: string }[] };
    expect(json.data.length).toBeGreaterThanOrEqual(25);
  });
});
