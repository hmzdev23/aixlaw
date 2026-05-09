/**
 * T6 API smoke tests. POST /api/engine/compliance, POST /api/engine/translate,
 * GET /api/engine/notary.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { POST as compliancePOST } from "@/app/api/engine/compliance/route";
import { POST as translatePOST } from "@/app/api/engine/translate/route";
import { GET as notaryGET } from "@/app/api/engine/notary/route";

import { __resetSessionsForTests } from "../_shared/sessionStore";
import { __resetCanliiForTests } from "../compliance/canliiClient";
import { __resetPiaForTests } from "../compliance/piaGenerator";
import { __resetTrueSightForTests } from "../compliance/trueSight";
import { __resetTranslatorCacheForTests } from "../compliance/translator";
import { __resetComplianceForTests } from "../compliance";

beforeEach(() => {
  __resetSessionsForTests();
  __resetCanliiForTests();
  __resetTrueSightForTests();
  __resetPiaForTests();
  __resetTranslatorCacheForTests();
  __resetComplianceForTests();
  process.env.GAMBIT_DISABLE_CANLII = "true";
  delete process.env.GOOGLE_CLOUD_TRANSLATION_KEY;
});

function postReq(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function getReq(url: string): Request {
  return new Request(url, { method: "GET" });
}

describe("/api/engine/compliance", () => {
  it("200s with the canonical 4-regime shape", async () => {
    const res = await compliancePOST(
      postReq("http://localhost/api/engine/compliance", {
        text: "Vendor must comply with ISO 27001 and provide notice within 24 hours.",
      })
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; data: Record<string, unknown> };
    expect(json.ok).toBe(true);
    expect(Object.keys(json.data)).toEqual(
      expect.arrayContaining(["trueSight", "osfi", "pipeda", "law25"])
    );
  });

  it("422s on missing text", async () => {
    const res = await compliancePOST(postReq("http://localhost/api/engine/compliance", {}));
    expect(res.status).toBe(422);
  });

  it("triggers TrueSight substitution under dealId=demo", async () => {
    const res = await compliancePOST(
      postReq("http://localhost/api/engine/compliance", {
        text: "Per Beaulieu v. Provincial Insurance, 2021 QCCA 412, this is fine.",
        dealId: "demo",
      })
    );
    const json = (await res.json()) as {
      data: { trueSight: { status: string } };
    };
    expect(json.data.trueSight.status).toBe("substituted");
  });

  it("forceLaw25 produces an EN + FR PIA", async () => {
    const res = await compliancePOST(
      postReq("http://localhost/api/engine/compliance", {
        text: "Vendor handles cross-border data transfers.",
        forceLaw25: true,
      })
    );
    const json = (await res.json()) as {
      data: { law25: { triggered: boolean; pia?: { sectionsEn: Record<string, string> } } };
    };
    expect(json.data.law25.triggered).toBe(true);
    expect(json.data.law25.pia?.sectionsEn).toBeDefined();
  });
});

describe("/api/engine/translate", () => {
  it("200s with target=en passing text through", async () => {
    const res = await translatePOST(
      postReq("http://localhost/api/engine/translate", {
        text: "Hello world.",
        target: "en",
      })
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { text: string } };
    expect(json.data.text).toBe("Hello world.");
  });

  it("200s with target=fr returning the warning fallback when no key", async () => {
    const res = await translatePOST(
      postReq("http://localhost/api/engine/translate", {
        text: "Hello world.",
        target: "fr",
      })
    );
    const json = (await res.json()) as { data: { text: string } };
    expect(json.data.text).toMatch(/^\[FR translation unavailable/);
  });

  it("422s on bad target", async () => {
    const res = await translatePOST(
      postReq("http://localhost/api/engine/translate", {
        text: "x",
        target: "klingon",
      })
    );
    expect(res.status).toBe(422);
  });
});

describe("/api/engine/notary", () => {
  it("200s with required=true for the demo deal (forceLaw25)", async () => {
    const res = await notaryGET(getReq("http://localhost/api/engine/notary?dealId=demo"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { required: boolean } };
    expect(json.data.required).toBe(true);
  });

  it("400s when dealId is missing", async () => {
    const res = await notaryGET(getReq("http://localhost/api/engine/notary"));
    expect(res.status).toBe(400);
  });

  it("404s for an unknown dealId", async () => {
    const res = await notaryGET(getReq("http://localhost/api/engine/notary?dealId=ghost"));
    expect(res.status).toBe(404);
  });
});
