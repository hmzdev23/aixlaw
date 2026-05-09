/**
 * GET /api/execution/stream?dealId=<id>
 *
 * Server-Sent Events stream of TimelineEvents for a deal. On reconnect, replays
 * the last <=20 buffered events before resuming live updates. Closes when
 * the engine signals completion (sentinel detail).
 *
 * SSE format: each message is a single `data: <json>\n\n` frame.
 *
 * Acceptance: "Timeline stream should replay last events for reconnects (keep
 * ring buffer 20)" — see lib/execution/timeline.ts.
 */

import { fail } from "@/lib/http";
import {
  SENTINEL_COMPLETE,
  subscribeToTimeline,
} from "@/lib/execution/timeline";
import type { TimelineEvent } from "@/lib/contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SSE_HEADERS: HeadersInit = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  // CORS-safe; Cockpit lives same-origin but make this explicit.
  "X-Accel-Buffering": "no",
};

function frame(event: TimelineEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function GET(req: Request): Response {
  const dealId = new URL(req.url).searchParams.get("dealId");
  if (!dealId) {
    return fail("missing_dealId", "Provide ?dealId=...", 400);
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      const safeEnqueue = (chunk: string): void => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const safeClose = (): void => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const sub = subscribeToTimeline(dealId, (ev) => {
        if (ev === SENTINEL_COMPLETE) {
          safeEnqueue("event: done\ndata: {}\n\n");
          sub.unsubscribe();
          safeClose();
          return;
        }
        safeEnqueue(frame(ev));
      });

      // Replay buffered events.
      for (const ev of sub.replay) safeEnqueue(frame(ev));

      if (sub.alreadyComplete) {
        safeEnqueue("event: done\ndata: {}\n\n");
        sub.unsubscribe();
        safeClose();
        return;
      }

      // Heartbeat every 15s so proxies don't kill the connection.
      const interval = setInterval(() => safeEnqueue(": heartbeat\n\n"), 15_000);

      // Honor client disconnect.
      const abort = (): void => {
        clearInterval(interval);
        sub.unsubscribe();
        safeClose();
      };
      req.signal.addEventListener("abort", abort, { once: true });
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
