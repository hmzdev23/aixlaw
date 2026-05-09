/**
 * POST /api/slack/post
 * Body: { text: string, memoTitle?: string, channel?: string }
 *
 * Posts to SLACK_WEBHOOK_URL. If unset, returns a stub success so the wizard
 * advances on stage.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  text: z.string().min(1).max(4000),
  memoTitle: z.string().optional(),
  channel: z.string().optional(),
});

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", "Need { text }.", 400);

  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    return ok({ mode: "stub", postedAt: new Date().toISOString() });
  }
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: `*${parsed.data.memoTitle ?? "Gambit memo"}*\n${parsed.data.text}`,
        channel: parsed.data.channel,
      }),
    });
    if (!r.ok) throw new Error(`Slack ${r.status}`);
    return ok({ mode: "live", postedAt: new Date().toISOString() });
  } catch (e) {
    console.warn("[slack.post] live failed", (e as Error).message);
    return ok({ mode: "stub_after_fail", postedAt: new Date().toISOString() });
  }
}
