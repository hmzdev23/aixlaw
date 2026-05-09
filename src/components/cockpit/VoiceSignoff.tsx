"use client";

import { useRef, useState } from "react";
import { Play, CheckCircle, Mic, RotateCcw } from "lucide-react";
import { useSignoff } from "@/hooks/useSignoff";

interface VoiceSignoffProps {
  dealId: string;
  onSigned?: () => void;
}

export function VoiceSignoff({ dealId, onSigned }: VoiceSignoffProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [ended, setEnded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fallbackAudio, setFallbackAudio] = useState(false);
  const signoff = useSignoff(dealId);
  const state = signoff.data?.state.state ?? "pending";
  const signed = state === "signed";

  async function startPlayback() {
    setBusy(true);
    try {
      await signoff.start();
      await audioRef.current?.play().catch(() => setFallbackAudio(true));
    } finally {
      setBusy(false);
    }
  }

  async function handleSign() {
    setBusy(true);
    try {
      await signoff.complete(true);
      onSigned?.();
    } finally {
      setBusy(false);
    }
  }

  function handleSimulate() {
    setEnded(true);
  }

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-gray-200)", background: "white" }}>
      <div className="flex items-center gap-2 mb-3">
        <Mic size={14} style={{ color: "var(--color-brand)" }} />
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-900)" }}>
          Voice Sign-off
        </p>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <audio
          ref={audioRef}
          src="/demo/sarah-send-it.m4a"
          onEnded={() => setEnded(true)}
          className="flex-1 w-full h-8"
          controls
        />
        <button
          onClick={handleSimulate}
          className="text-xs px-2 py-1 rounded-lg font-medium"
          style={{ background: "var(--color-gray-100)", color: "var(--color-gray-600)" }}
        >
          Skip
        </button>
      </div>

      {state === "pending" ? (
        <button
          onClick={() => void startPlayback()}
          disabled={busy}
          className="mb-3 w-full rounded-full bg-[#0c0a09] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Starting…" : "Start CEO memo"}
        </button>
      ) : null}

      {signed ? (
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: "rgba(0,196,140,0.08)" }}>
          <CheckCircle size={14} style={{ color: "var(--color-success)" }} />
          <p className="text-xs font-semibold" style={{ color: "var(--color-success)" }}>
            Signed — {signoff.data?.state.signedBy ?? "Sarah Chen"}, Co-founder & COO
          </p>
        </div>
      ) : (
        <button
          onClick={() => void handleSign()}
          disabled={!ended || state !== "playing" || busy}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all"
          style={{
            background: ended && state === "playing" ? "linear-gradient(135deg, #292524, #0c0a09)" : "var(--color-gray-100)",
            color: ended && state === "playing" ? "white" : "var(--color-gray-400)",
            cursor: ended && state === "playing" ? "pointer" : "not-allowed",
            boxShadow: ended && state === "playing" ? "0 4px 12px rgba(12,10,9,0.18)" : "none",
          }}
          aria-disabled={!ended || state !== "playing"}
        >
          {busy ? <RotateCcw size={14} className="animate-spin" /> : <Play size={14} />}
          Mark Signed via API
        </button>
      )}
      <p className="mt-2 text-[11px] text-[var(--muted)]">
        State: {state}{fallbackAudio ? " · audio playback blocked; use Skip" : ""}
      </p>
    </div>
  );
}
