"use client";

import { useMemo, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getScenario } from "@/lib/scenarios";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function flagClass(kind?: "warn" | "bad" | "info"): string {
  if (kind === "bad") return "hl-bad";
  if (kind === "warn") return "hl-warn";
  if (kind === "info") return "hl-info";
  return "";
}

export function ReviewStep() {
  const { state, dispatch } = useWizard();
  const doc = state.doc;
  const scenario = state.scenarioId ? getScenario(state.scenarioId) : null;
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const display = useMemo(() => {
    if (!scenario) return [];
    return scenario.paragraphs.map((p) => ({
      id: p.id,
      text: state.locale === "fr" ? p.fr : p.en,
      flag: p.flag,
      flagReason: p.flagReason,
      isSig: p.isSignatureBlock,
    }));
  }, [scenario, state.locale]);

  if (!doc || !scenario) {
    return <p className="muted">No document yet. Upload one first.</p>;
  }

  function setLocale(loc: "en" | "fr") {
    setTranslateError(null);
    if (loc === "fr" && state.locale !== "fr") {
      // Translation is hardcoded , instant. Show booking nudge.
      dispatch({ type: "SET_LOCALE", locale: "fr" });
      if (state.bookingFromTranslate?.booked == null) {
        setShowBookingModal(true);
      }
      return;
    }
    dispatch({ type: "SET_LOCALE", locale: loc });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">Review</h2>
          <p className="muted text-[13px]">
            {scenario.headline} · {display.length} paragraphs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="muted text-[12px]">Display:</span>
          <div
            className="flex overflow-hidden rounded-full border"
            style={{ borderColor: "var(--line-strong)" }}
          >
            <button
              type="button"
              onClick={() => setLocale("en")}
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
              onClick={() => setLocale("fr")}
              className="px-3 py-1 text-[12px] font-medium"
              style={{
                background: state.locale === "fr" ? "var(--ink)" : "white",
                color: state.locale === "fr" ? "white" : "var(--ink)",
              }}
            >
              FR
            </button>
          </div>
        </div>
      </header>

      {translateError ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{translateError}</p>
      ) : null}

      <div className="card scroll-y px-6 py-5" style={{ maxHeight: 480 }}>
        {display.map((p) => (
          <div key={p.id} className="mb-5">
            <p
              className={`text-[14px] leading-relaxed ${flagClass(p.flag)}`}
              style={{ color: "var(--ink)" }}
              dangerouslySetInnerHTML={{ __html: escapeHtml(p.text) }}
            />
            {p.flagReason ? (
              <p className="muted mt-1 text-[11px]">⚑ {p.flagReason}</p>
            ) : null}
          </div>
        ))}
      </div>

      <ul className="flex flex-wrap gap-3 text-[12px] muted">
        <li><span className="hl-bad">red</span> high-risk clause</li>
        <li><span className="hl-warn">amber</span> watch-list</li>
        <li><span className="hl-info">blue</span> compliance signal</li>
      </ul>

      <div className="mt-2 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>← Back</button>
        <button type="button" className="btn" onClick={() => dispatch({ type: "GOTO", step: "esig" })}>
          Continue → E-sig scan
        </button>
      </div>

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
            "Auto-flagged from Gambit because the contract was machine-translated to French. A certified legal translator should validate the binding language before signature.",
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
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[16px] font-semibold">Heads up , this is a machine translation</h3>
        <p className="muted mt-2 text-[13px]">
          For binding legal documents we recommend a human professional translator,
          especially for clauses you intend to sign in Quebec. Want to book a 30-minute
          review with our partner translator?
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
  const tzMs = d.getTime() - d.getTimezoneOffset() * 60_000;
  return new Date(tzMs).toISOString().slice(0, 16);
}
