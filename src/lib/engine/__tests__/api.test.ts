/**
 * Smoke tests for the Next.js route handlers. We invoke the route module
 * directly with a synthesized Request so we don't need a running dev server.
 *
 * Runs with GAMBIT_DISABLE_LLM=true (set in vitest.config.ts) so all paths
 * return their canned fallbacks. This catches:
 *   - bad input handling (missing dealId, missing nodeId, malformed JSON)
 *   - 200 happy path
 *   - structured error response shape
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { POST as ghostPOST } from "@/app/api/engine/ghost/route";
import { POST as treePOST } from "@/app/api/engine/tree/route";
import { GET as counterGET } from "@/app/api/engine/counter/route";
import { GET as walkawayGET } from "@/app/api/engine/walkaway/route";
import { POST as evalPOST } from "@/app/api/engine/eval/route";

import { __resetSessionsForTests } from "../_shared/sessionStore";
import { __resetGhostCacheForTests } from "../ghost/ghostEngine";
import { __resetTreeCachesForTests } from "../tree/treeEngine";
import { __resetWalkawayCacheForTests } from "../tree/walkawayService";

function makePostRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(url: string): Request {
  return new Request(url, { method: "GET" });
}

beforeEach(() => {
  __resetSessionsForTests();
  __resetGhostCacheForTests();
  __resetTreeCachesForTests();
  __resetWalkawayCacheForTests();
});

afterEach(() => {
  __resetGhostCacheForTests();
  __resetTreeCachesForTests();
  __resetWalkawayCacheForTests();
});

describe("/api/engine/ghost", () => {
  it("200s with canned ghost on the demo deal", async () => {
    const res = await ghostPOST(
      makePostRequest("http://localhost/api/engine/ghost", { dealId: "demo" })
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; data?: { counterpartyId: string } };
    expect(json.ok).toBe(true);
    expect(json.data?.counterpartyId).toBe("initech_procurement");
  });

  it("422s when dealId missing", async () => {
    const res = await ghostPOST(
      makePostRequest("http://localhost/api/engine/ghost", {})
    );
    expect(res.status).toBe(422);
  });

  it("400s when body is not JSON", async () => {
    const res = await ghostPOST(
      new Request("http://localhost/api/engine/ghost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      })
    );
    expect(res.status).toBe(400);
  });
});

describe("/api/engine/tree", () => {
  it("200s with a 3-branch tree", async () => {
    const res = await treePOST(
      makePostRequest("http://localhost/api/engine/tree", { dealId: "demo" })
    );
    const json = (await res.json()) as { ok: boolean; data?: { primaryBranchIds: string[] } };
    expect(res.status).toBe(200);
    expect(json.data?.primaryBranchIds.length).toBe(3);
  });

  it("404s for an unknown dealId", async () => {
    const res = await treePOST(
      makePostRequest("http://localhost/api/engine/tree", { dealId: "ghost-deal" })
    );
    expect(res.status).toBe(404);
  });
});

describe("/api/engine/counter", () => {
  it("200s for a known node id", async () => {
    const res = await counterGET(
      makeGetRequest(
        "http://localhost/api/engine/counter?id=demo&nodeId=n_a_brilliant"
      )
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; data?: { text: string } };
    expect(json.data?.text.length).toBeGreaterThan(10);
  });

  it("400s if id missing", async () => {
    const res = await counterGET(
      makeGetRequest("http://localhost/api/engine/counter?nodeId=n_a_brilliant")
    );
    expect(res.status).toBe(400);
  });
});

describe("/api/engine/walkaway", () => {
  it("200s with citations", async () => {
    const res = await walkawayGET(
      makeGetRequest("http://localhost/api/engine/walkaway?dealId=demo")
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      data?: { citations: unknown[] };
    };
    expect((json.data?.citations ?? []).length).toBeGreaterThanOrEqual(3);
  });
});

describe("/api/engine/eval", () => {
  it("200s with a number score", async () => {
    const res = await evalPOST(
      makePostRequest("http://localhost/api/engine/eval", {
        dealId: "demo",
        nodeId: "n_a_brilliant",
      })
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; data?: { score: number } };
    expect(typeof json.data?.score).toBe("number");
    expect(json.data!.score).toBeGreaterThanOrEqual(-4);
    expect(json.data!.score).toBeLessThanOrEqual(4);
  });
});
