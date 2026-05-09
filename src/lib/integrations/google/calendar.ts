/**
 * Calendar countdown helper for Cockpit deadline chip. Server-only.
 *
 * docs/tasks/07-will-inbound-auth.md §Calendar:
 *   - calendar.events.list for next 8 hours
 *   - find meeting with "board|exec" keywords or fixture event id
 *   - compute minutes until event; conflict: true if deal timer overlaps
 *
 * For the demo the chip data comes from `getNextHardStop` which returns either
 * a real upcoming event (when OAuth is live) or a fixture-shaped fallback so
 * the cold-open beat works on hostile Wi-Fi.
 */

import { google } from "googleapis";
import { buildOAuthClient } from "./client";
import type { InboundCalendarContext } from "@/lib/contracts";
import { logger } from "@/lib/util/logger";

const HARD_STOP_REGEX = /(board|exec(utive)?|hard stop)/i;
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export interface FindHardStopOpts {
  /** Window to search starting now. Default 8h. */
  windowMs?: number;
  /** Deal timer end ISO string used for conflict detection. */
  dealClockEndIso?: string;
}

/** Live Google Calendar lookup. Returns null if no qualifying event. */
export async function findNextHardStopLive(
  accessToken: string,
  opts: FindHardStopOpts = {},
): Promise<InboundCalendarContext | null> {
  const auth = buildOAuthClient(accessToken);
  const cal = google.calendar({ version: "v3", auth });

  const now = new Date();
  const windowMs = opts.windowMs ?? EIGHT_HOURS_MS;
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + windowMs).toISOString();

  let res;
  try {
    res = await cal.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 25,
    });
  } catch (err) {
    logger.warn("calendar list failed", { err: (err as Error).message });
    return null;
  }

  const events = res.data.items ?? [];
  const match = events.find((e) =>
    e.summary ? HARD_STOP_REGEX.test(e.summary) : false,
  );
  if (!match?.start?.dateTime) return null;

  const startIso = match.start.dateTime;
  const start = new Date(startIso);
  const conflict = isConflict(start, opts.dealClockEndIso);

  return {
    nextHardStop: startIso,
    eventTitle: match.summary ?? "Hard stop",
    conflict,
  };
}

/**
 * Demo-mode fallback: synthesizes a hard stop ~1h47m from "now" so the
 * countdown narrative ("Deal must close in 1h 47m") works without OAuth.
 */
export function syntheticDemoHardStop(
  baseNow: Date = new Date(),
): InboundCalendarContext {
  const start = new Date(baseNow.getTime() + (107 * 60 * 1000));
  return {
    nextHardStop: start.toISOString(),
    eventTitle: "Initech board readout",
    conflict: false,
  };
}

function isConflict(eventStart: Date, dealClockEndIso?: string): boolean {
  if (!dealClockEndIso) return false;
  const dealEnd = new Date(dealClockEndIso);
  if (Number.isNaN(dealEnd.getTime())) return false;
  return dealEnd.getTime() >= eventStart.getTime();
}
