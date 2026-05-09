/**
 * POST /api/calendar/book
 * Body: { title, whenIso, durationMins, attendeeEmail?, description? }
 *
 * Creates a Google Calendar event when GOOGLE_OAUTH_TOKEN is set. Otherwise
 * returns a deterministic stub so the wizard can advance. Either way, returns
 * an `addToCalendarUrl` (Google Calendar template link) the user can also click.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().min(1),
  whenIso: z.string().min(1),
  durationMins: z.number().int().positive().max(8 * 60).default(30),
  attendeeEmail: z.string().email().optional(),
  description: z.string().max(2000).optional(),
});

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", parsed.error.issues[0]?.message ?? "bad input", 400);

  const start = new Date(parsed.data.whenIso);
  if (Number.isNaN(start.getTime())) return fail("bad_when", "whenIso is invalid.", 400);
  const end = new Date(start.getTime() + parsed.data.durationMins * 60_000);

  const addToCalendarUrl = buildAddToCalendarUrl({
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    start,
    end,
    attendee: parsed.data.attendeeEmail,
  });

  const token = process.env.GOOGLE_OAUTH_TOKEN;
  if (!token) {
    return ok({
      mode: "stub",
      eventId: `stub_${start.getTime()}`,
      whenIso: start.toISOString(),
      addToCalendarUrl,
    });
  }

  // Live path: insert into the user's primary calendar via Google REST API.
  try {
    const r = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          summary: parsed.data.title,
          description: parsed.data.description ?? "Created by Gambit.",
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
          attendees: parsed.data.attendeeEmail ? [{ email: parsed.data.attendeeEmail }] : undefined,
        }),
      },
    );
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`Google ${r.status}: ${txt.slice(0, 200)}`);
    }
    const ev = (await r.json()) as { id: string; htmlLink?: string };
    return ok({
      mode: "live",
      eventId: ev.id,
      whenIso: start.toISOString(),
      htmlLink: ev.htmlLink,
      addToCalendarUrl,
    });
  } catch (e) {
    console.warn("[calendar.book] live failed, returning stub", (e as Error).message);
    return ok({
      mode: "stub_after_fail",
      eventId: `stub_${start.getTime()}`,
      whenIso: start.toISOString(),
      addToCalendarUrl,
      note: (e as Error).message,
    });
  }
}

function buildAddToCalendarUrl(opts: {
  title: string;
  description: string;
  start: Date;
  end: Date;
  attendee?: string;
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(opts.start)}/${fmt(opts.end)}`,
    details: opts.description,
  });
  if (opts.attendee) params.set("add", opts.attendee);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
