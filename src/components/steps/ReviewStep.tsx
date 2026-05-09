"use client";

import { useMemo, useState } from "react";
import { useWizard } from "@/components/wizard/state";

const FLAG_PATTERNS: { kind: "warn" | "bad" | "info"; re: RegExp; reason: string }[] = [
  { kind: "bad", re: /\b(unlimited|uncapped)\s+(liability|damages|indemnit\w+)\b/gi, reason: "Uncapped exposure" },
  { kind: "bad", re: /\bsole discretion\b/gi, reason: "Unilateral discretion" },
  { kind: "warn", re: /\b(perpetual|irrevocable)\b/gi, reason: "Perpetual/irrevocable" },
  { kind: "warn", re: /\bautomatic(?:ally)?\s+renew\w*/gi, reason: "Auto-renewal" },
  { kind: "warn", re: /\bgoverning law of\b[^.]*?\b(California|Delaware|New York|Ontario)\b/gi, reason: "Foreign forum" },
  { kind: "warn", re: /\b(audit|step[- ]in)\s+rights?\b/gi, reason: "Audit / step-in" },
  { kind: "info", re: /\b(personal information|renseignements? personnels?)\b/gi, reason: "Personal info — Law 25 / PIPEDA" },
  { kind: "info", re: /\b(electronic signature|signature électronique)\b/gi, reason: "E-signature clause" },
];

interface Flag {
  start: number;
  end: number;
  kind: "warn" | "bad" | "info";
  reason: string;
}

function highlight(p: string): { html: string; flags: Flag[] } {
  const flags: Flag[] = [];
  for (const pat of FLAG_PATTERNS) {
    pat.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pat.re.exec(p)) !== null) {
      flags.push({ start: m.index, end: m.index + m[0].length, kind: pat.kind, reason: pat.reason });
    }
  }
  flags.sort((a, b) => a.start - b.start);
  // resolve overlap by skipping later overlapping flags
  const ranges: Flag[] = [];
  for (const f of flags) {
    if (ranges.length === 0 || f.start >= ranges[ranges.length - 1].end) ranges.push(f);
  }
  let html = "";
  let cursor = 0;
  for (const f of ranges) {
    html += escapeHtml(p.slice(cursor, f.start));
    const cls = f.kind === "bad" ? "hl-bad" : f.kind === "warn" ? "hl-warn" : "hl-info";
    html += `<span class="${cls}" title="${escapeHtml(f.reason)}">${escapeHtml(p.slice(f.start, f.end))}</span>`;
    cursor = f.end;
  }
  html += escapeHtml(p.slice(cursor));
  return { html, flags: ranges };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function ReviewStep() {
  const { state, dispatch } = useWizard();
  const doc = state.doc;
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const paragraphs = doc?.paragraphs ?? [];
  const showFr = state.locale === "fr";
  const display = useMemo(() => {
    if (showFr && state.translation) return state.translation.paragraphs;
    return paragraphs;
  }, [paragraphs, state.translation, showFr]);

  if (!doc) {
    return <Empty message="No document yet. Go back and upload." />;
  }

  async function translate(target: "fr" | "en") {
    setTranslating(true);
    setTranslateError(null);
    try {
      if (target === "en") {
        dispatch({ type: "SET_LOCALE", locale: "en" });
        return;
      }
      // pull EN -> FR translation if not cached
      if (!state.translation) {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ paragraphs, target: "fr" }),
        });
        const j = (await res.json()) as
          | { ok: true; data: { paragraphs: string[] } }
          | { ok: false; error: { message: string } };
        if (!j.ok) throw new Error(j.error.message);
        dispatch({
          type: "SET_TRANSLATION",
          translation: { lang: "fr", paragraphs: j.data.paragraphs },
        });
      }
      dispatch({ type: "SET_LOCALE", locale: "fr" });
      // Flip booking nudge unless already answered.
      if (state.bookingFromTranslate?.booked == null) {
        setShowBookingModal(true);
      }
    } catch (e) {
      setTranslateError((e as Error).message);
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">Review</h2>
          <p className="muted text-[13px]">
            <strong className="font-medium" style={{ color: "var(--ink)" }}>{doc.filename}</strong>
            {" "}· {paragraphs.length} paragraphs
            {doc.pages ? ` · ${doc.pages} pages` : ""}
            {" "}· {(doc.byteSize / 1024).toFixed(1)} KB
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="muted text-[12px]">Display:</span>
          <div className="flex overflow-hidden rounded-full border" style={{ borderColor: "var(--line-strong)" }}>
            <button
              type="button"
              onClick={() => void translate("en")}
              className="px-3 py-1 text-[12px] font-medium"
              style={{
                background: state.locale === "en" ? "var(--ink)" : "white",
                color: state.locale === "en" ? "white" : "var(--ink)",
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => void translate("fr")}
              disabled={translating}
              className="px-3 py-1 text-[12px] font-medium"
              style={{
                background: state.locale === "fr" ? "var(--ink)" : "white",
                color: state.locale === "fr" ? "white" : "var(--ink)",
              }}
            >
              {translating ? "…" : "FR"}
            </button>
          </div>
        </div>
      </header>

      {translateError ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{translateError}</p>
      ) : null}

      <div className="card scroll-y px-6 py-5" style={{ maxHeight: 480 }}>
        {display.length === 0 ? (
          <p className="muted text-[13px]">Empty document.</p>
        ) : (
          display.map((p, i) => {
            const { html } = highlight(p);
            return (
              <p
                key={i}
                className="mb-4 text-[14px] leading-relaxed"
                style={{ color: "var(--ink)" }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          })
        )}
      </div>

      <Legend />

      <Footer
        onBack={() => dispatch({ type: "BACK" })}
        onNext={() => dispatch({ type: "GOTO", step: "esig" })}
      />

      {showBookingModal ? (
        <FrenchBookingModal
          onClose={() => setShowBookingModal(false)}
          onBooked={(whenIso) => {
            dispatch({
              type: "SET_BOOKING_FROM_TRANSLATE",
              booking: { booked: true, whenIso },
            });
            setShowBookingModal(false);
          }}
          onSkip={() => {
            dispatch({
              type: "SET_BOOKING_FROM_TRANSLATE",
              booking: { booked: false },
            });
            setShowBookingModal(false);
          }}
        />
      ) : null}
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-3 text-[12px] muted">
      <li><span className="hl-bad">red</span> = high-risk clause</li>
      <li><span className="hl-warn">amber</span> = watch-list clause</li>
      <li><span className="hl-info">blue</span> = compliance signal</li>
    </ul>
  );
}

function Empty({ message }: { message: string }) {
  return <p className="muted text-[14px]">{message}</p>;
}

function Footer({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="mt-2 flex justify-between">
      <button type="button" className="btn btn-ghost" onClick={onBack}>← Back</button>
      <button type="button" className="btn" onClick={onNext}>Continue → E-sig scan</button>
    </div>
  );
}

function FrenchBookingModal({
  onClose,
  onBooked,
  onSkip,
}: {
  onClose: () => void;
  onBooked: (whenIso: string) => void;
  onSkip: () => void;
}) {
  const [when, setWhen] = useState(defaultWhen());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function book() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Professional translation review (FR)",
          whenIso: new Date(when).toISOString(),
          durationMins: 30,
          description:
            "Auto-flagged from Gambit because the contract was machine-translated to French. A certified legal translator should validate before signature.",
        }),
      });
      const j = (await res.json()) as
        | { ok: true; data: { whenIso: string } }
        | { ok: false; error: { message: string } };
      if (!j.ok) throw new Error(j.error.message);
      onBooked(j.data.whenIso);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[16px] font-semibold">Heads up — this is a machine translation</h3>
        <p className="muted mt-2 text-[13px]">
          For binding legal documents we recommend a human professional translator,
          especially for clauses you intend to sign in Quebec. Want to book a
          30-minute review with our partner translator?
        </p>

        <label className="mt-5 block">
          <span className="label">When</span>
          <input
            type="datetime-local"
            className="input mt-1"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </label>

        {err ? (
          <p className="mt-3 text-[12px]" style={{ color: "var(--negative)" }}>{err}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onSkip}>No thanks</button>
          <button type="button" className="btn" disabled={busy} onClick={() => void book()}>
            {busy ? "Booking…" : "Book in Google Calendar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function defaultWhen(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  // toISOString -> minus tz offset, then slice
  const tzMs = d.getTime() - d.getTimezoneOffset() * 60_000;
  return new Date(tzMs).toISOString().slice(0, 16);
}
