/**
 * T5 API smoke + integration. NDJSON streams, playbook CRUD, and execute.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { POST as councilPOST } from "@/app/api/engine/council/route";
import { POST as aivsaiPOST } from "@/app/api/engine/aivsai/route";
import { GET as playbooksList, POST as playbooksPOST } from "@/app/api/playbooks/route";
import { GET as playbookGET } from "@/app/api/playbooks/[id]/route";
import { POST as playbookExecute } from "@/app/api/playbooks/[id]/execute/route";

import { __resetSessionsForTests } from "../_shared/sessionStore";
import { __resetGhostCacheForTests } from "../ghost/ghostEngine";
import { __resetTreeCachesForTests } from "../tree/treeEngine";
import { __resetCouncilCacheForTests } from "../council/councilService";
import { __resetCouncilStoreForTests } from "../council/store";
import { __resetPlaybookStorageForTests } from "../architect/repository";
import { __resetGhostFixtureCacheForTests } from "../_shared/ghostFixtures";
import { collectNdjson } from "../_shared/ndjson";

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "gambit-api-"));
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
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("/api/engine/council (NDJSON stream)", () => {
  it("streams 5 DebateEvents + a result line", async () => {
    const res = await councilPOST(
      postReq("http://localhost/api/engine/council", { dealId: "demo", moveId: "n_a_brilliant" })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/x-ndjson");
    const lines = await collectNdjson<Record<string, unknown>>(res);
    // 5 DebateEvents + 1 result envelope
    expect(lines.length).toBe(6);
    const last = lines.at(-1)!;
    expect(last.kind).toBe("result");
  });

  it("422s on missing moveId", async () => {
    const res = await councilPOST(
      postReq("http://localhost/api/engine/council", { dealId: "demo" })
    );
    expect(res.status).toBe(422);
  });

  it("404s on unknown deal", async () => {
    const res = await councilPOST(
      postReq("http://localhost/api/engine/council", {
        dealId: "no-such",
        moveId: "n_a_brilliant",
      })
    );
    expect(res.status).toBe(404);
  });
});

describe("/api/engine/aivsai (NDJSON stream)", () => {
  it("streams alternating events ending with a concession", async () => {
    const res = await aivsaiPOST(
      postReq("http://localhost/api/engine/aivsai", {
        clauseText: "MSA §7.1 carve-out for Section 9 must remain uncapped per Initech standard.",
        leftGhostId: "initech_procurement",
        rightGhostId: "dunder_founder",
        maxRounds: 6,
      })
    );
    expect(res.status).toBe(200);
    const lines = await collectNdjson<Record<string, unknown>>(res);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    const agents = lines.map((l) => l.agent);
    expect(agents[0]).toBe("counterpart_left");
    expect(agents[1]).toBe("counterpart_right");
  });

  it("422s on too-short clauseText", async () => {
    const res = await aivsaiPOST(
      postReq("http://localhost/api/engine/aivsai", {
        clauseText: "tiny",
        leftGhostId: "initech_procurement",
        rightGhostId: "dunder_founder",
        maxRounds: 4,
      })
    );
    expect(res.status).toBe(422);
  });
});

describe("/api/playbooks CRUD + execute", () => {
  it("lists, gets, saves, and executes the default playbook", async () => {
    const listRes = await playbooksList();
    expect(listRes.status).toBe(200);
    const list = (await listRes.json()) as {
      ok: boolean;
      data: { id: string }[];
    };
    expect(list.data.find((p) => p.id === "pb_default")).toBeDefined();

    const getRes = await playbookGET(new Request("http://localhost/api/playbooks/pb_default"), {
      params: Promise.resolve({ id: "pb_default" }),
    });
    expect(getRes.status).toBe(200);
    const get = (await getRes.json()) as { data: { name: string } };
    expect(get.data.name).toContain("Default");

    const saveRes = await playbooksPOST(
      postReq("http://localhost/api/playbooks", {
        id: "pb_test_api",
        name: "API Round-trip",
        version: "1.0.0",
        createdBy: "test",
        updatedAt: new Date().toISOString(),
        blocks: [
          { id: "b1", type: "ghost", position: { x: 0, y: 0 }, params: {} },
          { id: "b2", type: "tree", position: { x: 100, y: 0 }, params: {} },
          { id: "b3", type: "crown", position: { x: 200, y: 0 }, params: {} },
        ],
        edges: [
          { id: "e1", source: "b1", target: "b2" },
          { id: "e2", source: "b2", target: "b3" },
        ],
      })
    );
    expect(saveRes.status).toBe(201);

    const execRes = await playbookExecute(
      postReq("http://localhost/api/playbooks/pb_default/execute", { dealId: "demo" }),
      { params: Promise.resolve({ id: "pb_default" }) }
    );
    expect(execRes.status).toBe(200);
    const exec = (await execRes.json()) as {
      data: { dealId: string; financials: { currency: string } };
    };
    expect(exec.data.dealId).toBe("demo");
    expect(exec.data.financials.currency).toBe("CAD");
  });

  it("rejects invalid playbook on POST", async () => {
    const res = await playbooksPOST(postReq("http://localhost/api/playbooks", {}));
    expect(res.status).toBe(422);
  });

  it("404s on unknown playbook GET", async () => {
    const res = await playbookGET(new Request("http://localhost/api/playbooks/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });
    expect(res.status).toBe(404);
  });
});
