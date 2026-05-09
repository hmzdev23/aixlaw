/**
 * GET /api/inbound/latest?dealId=<id>
 *
 * Without dealId: returns the most recent InboundEvent across the in-memory
 * store, or 404 if nothing has been triggered yet.
 *
 * With dealId: returns the event for that deal, or 404 if unknown.
 */

import { fail, ok } from "@/lib/http";
import {
  getInboundEvent,
  getLatestInboundEvent,
} from "@/lib/integrations/inbound/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request): Response {
  const url = new URL(req.url);
  const dealId = url.searchParams.get("dealId");

  const event = dealId ? getInboundEvent(dealId) : getLatestInboundEvent();
  if (!event) {
    return fail(
      "not_found",
      dealId
        ? `No inbound event for dealId=${dealId}.`
        : "No inbound events yet. POST /api/demo/trigger first.",
      404,
    );
  }
  return ok({ event });
}
