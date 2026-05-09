/**
 * WorkProductService implementation. Server-only.
 *
 * Wraps the docx + supervisor PDF builders with byte caching so re-fetches
 * (e.g., demo replay or browser hard refresh) are instant. Cache is keyed by
 * dealId via decisionStore.
 *
 * `documentFocus` selection: we infer from the related InboundEvent if present
 * in the inbound store; default to "msa" because that's the Cockpit's primary
 * pile per the demo script.
 */

import type { Decision, WorkProductService } from "@/lib/contracts";
import { buildCounterRedlineDocx } from "./docxBuilder";
import {
  buildSupervisorPdf,
  type SupervisorMode,
} from "./supervisorPdf";
import {
  cacheCounterDocx,
  cacheSupervisorPdf,
  getStoredDecision,
} from "./decisionStore";
import { getInboundEvent } from "@/lib/integrations/inbound/store";

function inferFocus(decision: Decision): "nda" | "msa" {
  const inbound = getInboundEvent(decision.dealId);
  return inbound?.documentFocus ?? "msa";
}

export class WorkProductServiceImpl implements WorkProductService {
  async buildCounterRedlineDocx(decision: Decision): Promise<Uint8Array> {
    const stored = getStoredDecision(decision.dealId);
    if (stored?.cache.counterDocx) return stored.cache.counterDocx;
    const bytes = await buildCounterRedlineDocx({
      decision,
      documentFocus: inferFocus(decision),
    });
    if (stored) cacheCounterDocx(decision.dealId, bytes);
    return bytes;
  }

  async buildSupervisorPdf(
    decision: Decision,
    mode: "legal" | "plain",
  ): Promise<Uint8Array> {
    const stored = getStoredDecision(decision.dealId);
    const cached =
      mode === "legal"
        ? stored?.cache.supervisorPdfLegal
        : stored?.cache.supervisorPdfPlain;
    if (cached) return cached;
    const bytes = await buildSupervisorPdf({
      decision,
      mode: mode as SupervisorMode,
      documentFocus: inferFocus(decision),
    });
    if (stored) cacheSupervisorPdf(decision.dealId, mode, bytes);
    return bytes;
  }
}

let singleton: WorkProductServiceImpl | undefined;

export function getWorkProductService(): WorkProductServiceImpl {
  if (!singleton) singleton = new WorkProductServiceImpl();
  return singleton;
}
