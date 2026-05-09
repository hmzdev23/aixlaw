/**
 * POST /api/inbound/manual
 *
 * Forces a one-shot Gmail fetch using the signed-in user's access token. Useful
 * to refresh from an inbox without waiting for the polling watcher tick.
 *
 * Falls back to the demo trigger when GAMBIT_DEMO_MODE=true is set, so the
 * manual button on the Cockpit always returns a usable event.
 */

import { fail, ok } from "@/lib/http";
import { getAppSession } from "@/lib/auth/session";
import { getInboundService } from "@/lib/integrations/inbound/factory";
import { logger } from "@/lib/util/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  try {
    const session = await getAppSession();
    const inbound = await getInboundService();

    if (session?.isDemo || !session?.accessToken) {
      // No live token -> fixture-backed manual demo. The Cockpit doesn't care
      // which path produced the event; the InboundEvent shape is identical.
      const event = await inbound.triggerManualDemo();
      return ok({ event, source: "manual_demo" });
    }

    const event = await inbound.fetchOnceFromGmail();
    if (!event) {
      return fail(
        "no_messages",
        "Inbox has no redline messages matching the classifier.",
        404,
      );
    }
    return ok({ event, source: "gmail" });
  } catch (err) {
    logger.error("manual inbound fetch failed", {
      err: (err as Error).message,
    });
    return fail("internal", "Manual fetch failed.", 500);
  }
}
