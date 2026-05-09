/**
 * ExecutionEngine — implements the 5-step pipeline from docs/tasks/09 §"Execution
 * pipeline" / DEMO_SCRIPT 3:05–3:20. Server-only.
 *
 *   1. email_received    (immediate done — narrative)
 *   2. counter_sent      (after WorkProductService produces a docx — uses
 *                         WorkProductService.buildCounterRedlineDocx; cached)
 *   3. invoice_generated (Stripe test invoice in CAD; never blocks demo)
 *   4. seats_provisioned (POST internal /api/provisioning/allocate)
 *   5. notary_queued     (append to data/notary_queue.jsonl)
 *
 * The engine emits TimelineEvents to the per-deal timeline (timeline.ts) so
 * the SSE route can stream them, and ALSO exposes an AsyncIterable that
 * matches the contract `ExecutionEngine.fire(decision) -> AsyncIterable<...>`.
 *
 * Failure policy: a single step error is captured as
 * `{ status: "error", detail }` and the pipeline CONTINUES. The fallback
 * plan in the spec explicitly allows this — we never strand the demo on a
 * Stripe outage.
 */

import type {
  Decision,
  ExecutionEngine,
  TimelineEvent,
} from "@/lib/contracts";
import { logger } from "@/lib/util/logger";
import {
  markTimelineComplete,
  publishTimelineEvent,
} from "./timeline";
import { createDemoInvoice } from "@/lib/integrations/stripe/client";
import { allocate } from "./provisioning";
import { enqueueNotaryJob } from "./notaryQueue";
import { getWorkProductService } from "@/lib/workproduct/service";
import { singleton } from "@/lib/util/globalSingleton";

const DEMO_SEAT_COUNT = 50; // matches the demo narrative

class ExecutionEngineImpl implements ExecutionEngine {
  async *fire(decision: Decision): AsyncIterable<TimelineEvent> {
    const dealId = decision.dealId;
    logger.info("execution: fire", {
      dealId,
      moveId: decision.chosenMoveId,
    });

    yield* runStep(dealId, "email_received", async () => ({
      detail: "Initech procurement redline received.",
    }));

    yield* runStep(dealId, "counter_sent", async () => {
      // Re-build (or fetch cached) counter docx so the timeline + work-product
      // routes never disagree about whether step 2 actually happened.
      const bytes = await getWorkProductService().buildCounterRedlineDocx(
        decision,
      );
      return {
        detail: `Counter-redline package ready (${bytes.byteLength} B).`,
      };
    });

    yield* runStep(dealId, "invoice_generated", async () => {
      const r = await createDemoInvoice(decision);
      if (!r.ok) {
        // Non-fatal — record what we know.
        return { error: true, detail: r.detail };
      }
      const amount =
        typeof r.amountCad === "number"
          ? `$${r.amountCad.toLocaleString("en-CA")} CAD`
          : "test invoice";
      const url = r.hostedUrl ? ` (${r.hostedUrl})` : "";
      return {
        detail: `Stripe invoice ${r.invoiceId} for ${amount}${url}.`,
      };
    });

    yield* runStep(dealId, "seats_provisioned", async () => {
      const tier = decision.financials.tier;
      const seats = decision.financials.seats || DEMO_SEAT_COUNT;
      const rec = await allocate({ dealId, tier, seats });
      return {
        detail: `${rec.seats} ${rec.tier} seats provisioned for ${rec.dealId}.`,
      };
    });

    yield* runStep(dealId, "notary_queued", async () => {
      const job = await enqueueNotaryJob({ dealId });
      return {
        detail: `Notary job ${job.jobId} queued for ${job.jurisdiction}.`,
      };
    });

    markTimelineComplete(dealId);
  }
}

interface StepOutcome {
  detail?: string;
  error?: boolean;
}

async function* runStep(
  dealId: string,
  step: TimelineEvent["step"],
  exec: () => Promise<StepOutcome>,
): AsyncIterable<TimelineEvent> {
  // Emit a `pending` ahead of the work so the UI can highlight the live step.
  const startEvent: TimelineEvent = {
    step,
    status: "pending",
    at: new Date().toISOString(),
  };
  publishTimelineEvent(dealId, startEvent);
  yield startEvent;

  let result: StepOutcome;
  try {
    result = await exec();
  } catch (err) {
    const message = (err as Error).message;
    logger.warn("execution: step failed", { dealId, step, message });
    const errEvent: TimelineEvent = {
      step,
      status: "error",
      at: new Date().toISOString(),
      detail: message,
    };
    publishTimelineEvent(dealId, errEvent);
    yield errEvent;
    return;
  }

  const doneEvent: TimelineEvent = {
    step,
    status: result.error ? "error" : "done",
    at: new Date().toISOString(),
    detail: result.detail,
  };
  publishTimelineEvent(dealId, doneEvent);
  yield doneEvent;
}

export function getExecutionEngine(): ExecutionEngineImpl {
  return singleton(
    "execution:engineService",
    () => new ExecutionEngineImpl(),
  );
}

/**
 * Fire-and-forget wrapper for /api/execution/fire. Drains the AsyncIterable
 * in the background (events are already published to the timeline) so the
 * HTTP response can return immediately while the Cockpit subscribes to
 * /api/execution/stream.
 */
export function fireBackground(decision: Decision): void {
  void (async () => {
    try {
      // Drain. Each iteration already publishes to the timeline.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of getExecutionEngine().fire(decision)) {
        /* noop */
      }
    } catch (err) {
      logger.error("execution: fireBackground crashed", {
        err: (err as Error).message,
        dealId: decision.dealId,
      });
    }
  })();
}
