#!/usr/bin/env node
/**
 * scripts/smoke-demo.mjs
 *
 * Sequential smoke test against a running `npm run dev` (or `next start`).
 * Walks the demo arc: trigger inbound -> POST decision -> fetch docx +
 * supervisor PDFs -> fire execution -> drain SSE stream -> assert all 5
 * timeline events arrived in order with `done` (or `error`) status.
 *
 * docs/tasks/09 acceptance:
 *   "Smoke script passes against `pnpm dev` on clean boot."
 *
 * Exit code:
 *   0 — all assertions passed
 *   non-zero — any failure (fetch error, missing event, wrong order, etc.)
 *
 * Usage:
 *   GAMBIT_BASE_URL=http://localhost:3000 node scripts/smoke-demo.mjs
 *   npm run demo:smoke
 */

const BASE = process.env.GAMBIT_BASE_URL ?? "http://localhost:3000";

const EXPECTED_STEPS = [
  "email_received",
  "counter_sent",
  "invoice_generated",
  "seats_provisioned",
  "notary_queued",
];

let failures = 0;
let stepCount = 0;

const start = Date.now();
function elapsed() {
  return `${((Date.now() - start) / 1000).toFixed(2)}s`;
}

function pass(msg) {
  console.log(`  ✓ ${msg} [${elapsed()}]`);
  stepCount += 1;
}

function fail(msg) {
  console.log(`  ✗ ${msg} [${elapsed()}]`);
  failures += 1;
}

async function jsonOrThrow(res, label) {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `${label}: HTTP ${res.status} ${res.statusText} :: ${text.slice(0, 200)}`,
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label}: invalid JSON :: ${text.slice(0, 200)}`);
  }
}

async function expectStatus(res, label, expected = 200) {
  if (res.status !== expected) {
    const text = await res.text();
    throw new Error(
      `${label}: expected HTTP ${expected}, got ${res.status} :: ${text.slice(0, 200)}`,
    );
  }
}

async function main() {
  console.log(`Gambit smoke (${BASE})`);
  const smokeDealId = `demo_smoke_${Date.now()}`;

  // 1. Trigger inbound (manual demo).
  let dealId;
  {
    const res = await fetch(`${BASE}/api/demo/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId: smokeDealId, documentFocus: "msa" }),
    });
    const body = await jsonOrThrow(res, "trigger");
    dealId = body?.data?.event?.dealId;
    if (!dealId) throw new Error("trigger: no dealId in response");
    pass(`inbound triggered (dealId=${dealId})`);
  }

  // 2. Personas reachable.
  {
    const res = await fetch(`${BASE}/api/personas`);
    const body = await jsonOrThrow(res, "personas");
    if (!Array.isArray(body?.data?.personas) || body.data.personas.length < 3) {
      throw new Error("personas: expected >=3 records");
    }
    pass(`personas (${body.data.personas.length})`);
  }

  // 3. Spellbook issues fixture.
  {
    const res = await fetch(
      `${BASE}/api/spellbook/issues?dealId=${dealId}&kind=msa`,
    );
    const body = await jsonOrThrow(res, "spellbook");
    if (!Array.isArray(body?.data?.issues) || body.data.issues.length !== 13) {
      throw new Error(
        `spellbook: expected 13 MSA issues, got ${body?.data?.issues?.length}`,
      );
    }
    pass(`spellbook issues fixture (R01..R13, ${body.data.count})`);
  }

  // 4. POST Decision.
  const decision = {
    dealId,
    chosenMoveId: "move_a_brilliant",
    counterpartyId: "initech_procurement",
    summaryLegal:
      "Cap raised to greater of 24 months fees or CAD 5M for breach; remove convenience termination; retain platform IP with Client license to outputs.",
    summaryPlain:
      "We push back on the three deal-killers (uncapped breach, convenience exit, IP loss) and trade on payment + insurance to keep the deal alive.",
    financials: {
      currency: "CAD",
      monthlyAmount: 7500,
      netDays: 45,
      months: 24,
      tier: "Enterprise",
      seats: 50,
      totalContractCad: 180000,
    },
    complianceFlags: ["osfi_b13:third_party_risk", "pipeda:cross_border"],
    citationsUsed: [{ title: "Bhasin v. Hrynew", citation: "2014 SCC 71" }],
    locale: "en",
  };
  {
    const res = await fetch(`${BASE}/api/workproduct/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(decision),
    });
    const body = await jsonOrThrow(res, "decision");
    if (!body?.data?.stored) throw new Error("decision: not stored");
    pass(`decision stored (duplicate=${body.data.duplicate})`);
  }

  // 5. Fetch counter docx.
  {
    const res = await fetch(
      `${BASE}/api/workproduct/docx?dealId=${dealId}`,
    );
    await expectStatus(res, "docx");
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength < 4 || buf[0] !== 0x50 || buf[1] !== 0x4b) {
      throw new Error(
        `docx: not a valid ZIP/.docx (first bytes ${buf[0]} ${buf[1]})`,
      );
    }
    pass(`counter docx (${buf.byteLength} B)`);
  }

  // 6. Supervisor PDFs (legal + plain).
  for (const mode of ["legal", "plain"]) {
    const res = await fetch(
      `${BASE}/api/workproduct/supervisor?dealId=${dealId}&mode=${mode}`,
    );
    await expectStatus(res, `supervisor:${mode}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    const head = String.fromCharCode(...buf.slice(0, 4));
    if (head !== "%PDF") {
      throw new Error(`supervisor:${mode}: not a PDF (head=${head})`);
    }
    if (buf.byteLength > 500_000) {
      throw new Error(
        `supervisor:${mode}: ${buf.byteLength} B exceeds 500 KB acceptance bound`,
      );
    }
    pass(`supervisor PDF ${mode} (${buf.byteLength} B)`);
  }

  // 7. Voice sign-off state machine.
  {
    let res = await fetch(`${BASE}/api/signoff/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId }),
    });
    let body = await jsonOrThrow(res, "signoff:start");
    if (body?.data?.state?.state !== "playing") {
      throw new Error(`signoff:start: expected playing, got ${body?.data?.state?.state}`);
    }
    res = await fetch(`${BASE}/api/signoff/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId, approved: true }),
    });
    body = await jsonOrThrow(res, "signoff:complete");
    if (body?.data?.state?.state !== "signed") {
      throw new Error(`signoff:complete: expected signed`);
    }
    pass("voice sign-off pending -> playing -> signed");
  }

  // 8. Fire execution and drain stream.
  {
    const res = await fetch(`${BASE}/api/execution/fire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId }),
    });
    await jsonOrThrow(res, "execution:fire");
    pass("execution fired");
  }

  const observed = await collectTimeline(dealId, 12_000);
  // Execution emits BOTH a `pending` and a `done` for each step. We expect to
  // see each step appear at least once (in either status). Order by first-seen
  // pending should match EXPECTED_STEPS.
  const firstSeen = [];
  for (const ev of observed) {
    if (!firstSeen.includes(ev.step)) firstSeen.push(ev.step);
  }
  if (
    firstSeen.length < EXPECTED_STEPS.length ||
    !EXPECTED_STEPS.every((s, i) => firstSeen[i] === s)
  ) {
    fail(
      `timeline order mismatch — expected ${EXPECTED_STEPS.join(",")} got ${firstSeen.join(",")}`,
    );
  } else {
    pass(`timeline: 5 ordered steps streamed`);
  }

  const finalByStep = new Map();
  for (const ev of observed) finalByStep.set(ev.step, ev);
  for (const step of EXPECTED_STEPS) {
    const ev = finalByStep.get(step);
    if (!ev) {
      fail(`timeline missing final event for ${step}`);
      continue;
    }
    // Stripe step is allowed to be `error` if STRIPE_SECRET_KEY is unset —
    // that's the documented fallback.
    if (
      ev.status === "done" ||
      (step === "invoice_generated" && ev.status === "error")
    ) {
      pass(`step ${step} -> ${ev.status}`);
    } else {
      fail(`step ${step} ended in unexpected status ${ev.status}: ${ev.detail}`);
    }
  }

  // 9. Provisioning + notary side-effects.
  {
    const res = await fetch(`${BASE}/api/provisioning/allocate`);
    const body = await jsonOrThrow(res, "provisioning:get");
    if (!Array.isArray(body?.data?.records)) {
      fail("provisioning records missing");
    } else if (
      !body.data.records.some(
        (r) => r.dealId === dealId && r.seats === 50,
      )
    ) {
      fail(
        `provisioning: no record with dealId=${dealId} seats=50 (got ${JSON.stringify(body.data.records)})`,
      );
    } else {
      pass(`provisioning: 50 seats recorded for ${dealId}`);
    }
  }
  {
    const res = await fetch(`${BASE}/api/notary/queue`);
    const body = await jsonOrThrow(res, "notary:get");
    if (
      !Array.isArray(body?.data?.jobs) ||
      !body.data.jobs.some((j) => j.dealId === dealId)
    ) {
      fail(`notary queue: no job for ${dealId}`);
    } else {
      pass(`notary queue: job present for ${dealId}`);
    }
  }

  console.log("");
  if (failures > 0) {
    console.log(`FAILED — ${failures} assertion(s), ${stepCount} passed`);
    process.exit(1);
  }
  console.log(`OK — ${stepCount} assertions in ${elapsed()}`);
}

async function collectTimeline(dealId, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const res = await fetch(
    `${BASE}/api/execution/stream?dealId=${dealId}`,
    { signal: ctrl.signal },
  );
  if (!res.ok || !res.body) {
    clearTimeout(timer);
    throw new Error(`stream: HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  const events = [];
  let done = false;

  try {
    while (!done) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buf += decoder.decode(chunk.value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const block = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        if (block.startsWith("event: done")) {
          done = true;
          break;
        }
        for (const line of block.split("\n")) {
          if (line.startsWith("data: ")) {
            const json = line.slice("data: ".length);
            try {
              const obj = JSON.parse(json);
              events.push(obj);
            } catch {
              /* ignore non-json frames */
            }
          }
        }
      }
    }
  } catch (err) {
    if (err?.name !== "AbortError") throw err;
  } finally {
    clearTimeout(timer);
    try {
      await reader.cancel();
    } catch {
      /* ignore */
    }
  }
  return events;
}

main().catch((err) => {
  console.error(`SMOKE FAILED: ${err.message}`);
  process.exit(1);
});
