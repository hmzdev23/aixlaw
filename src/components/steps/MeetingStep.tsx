"use client";

import { useState } from "react";
import { useWizard } from "@/components/wizard/state";

function defaultWhen(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(11, 0, 0, 0);
  const tzMs = d.getTime() - d.getTimezoneOffset() * 60_000;
  return new Date(tzMs).toISOString().slice(0, 16);
}

export function MeetingStep() {
  const { state, dispatch } = useWizard();
  const [needed, setNeeded] = useState<boolean | null>(state.meetingNeeded);
  const [when, setWhen] = useState<string>(defaultWhen());
  const [title, setTitle] = useState<string>(`Negotiation review — ${state.doc?.filename ?? "contract"}`);
  const [attendee, setAttendee] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function book() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          whenIso: new Date(when).toISOString(),
          durationMins: 30,
          attendeeEmail: attendee || undefined,
          description: `Goal: ${state.goal}\n\nFinal win bar: ${state.score.toFixed(1)}\nDecisions: ${state.decisionTree
            .filter((n) => state.decisionPath.includes(n.id))
            .map((d) => d.label)
            .join(" → ") || "(none)"}`,
        }),
      });
      const j = (await res.json()) as
        | { ok: true; data: { whenIso: string; addToCalendarUrl: string; htmlLink?: string } }
        | { ok: false; error: { message: string } };
      if (!j.ok) throw new Error(j.error.message);
      setLink(j.data.htmlLink ?? j.data.addToCalendarUrl);
      dispatch({
        type: "SET_MEETING",
        meeting: { booked: true, whenIso: j.data.whenIso, title },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function setAnswer(v: boolean) {
    setNeeded(v);
    dispatch({ type: "SET_MEETING_NEEDED", v });
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight">Need to set a meeting?</h2>
        <p className="muted text-[13px]">
          We can drop a 30-min review on Google Calendar with everything decided
          here. If we don&apos;t have OAuth, we&apos;ll give you a one-click
          &ldquo;add to Google Calendar&rdquo; link instead.
        </p>
      </header>

      {needed === null ? (
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={() => setAnswer(true)}>Yes, schedule one</button>
          <button type="button" className="btn btn-secondary" onClick={() => setAnswer(false)}>No, skip</button>
        </div>
      ) : needed ? (
        <div className="card grid gap-3 px-5 py-5 md:grid-cols-2">
          <label className="block">
            <span className="label">Title</span>
            <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Attendee email (optional)</span>
            <input className="input mt-1" value={attendee} onChange={(e) => setAttendee(e.target.value)} placeholder="counsel@firm.com" />
          </label>
          <label className="block md:col-span-2">
            <span className="label">When</span>
            <input
              type="datetime-local"
              className="input mt-1"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
          </label>
          <div className="md:col-span-2 flex items-center justify-between gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setAnswer(false)}>Actually, skip</button>
            <button type="button" className="btn" disabled={busy} onClick={() => void book()}>
              {busy ? "Booking…" : "Book in Google Calendar"}
            </button>
          </div>
          {error ? (
            <p className="md:col-span-2 text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
          ) : null}
          {state.meeting?.booked ? (
            <div className="md:col-span-2 rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: "var(--positive)", background: "#eaf6ee", color: "var(--positive)" }}>
              ✓ Booked for {new Date(state.meeting.whenIso!).toLocaleString()}.
              {link ? (
                <>
                  {" "}<a href={link} target="_blank" rel="noreferrer noopener">Open in Google Calendar</a>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="muted text-[13px]">Skipped meeting scheduling.</p>
      )}

      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>← Back</button>
        <button
          type="button"
          className="btn"
          onClick={() => dispatch({ type: "GOTO", step: "memo" })}
        >
          Continue → Need a Slack memo?
        </button>
      </div>
    </div>
  );
}
