"use client";

import { useRef, useState } from "react";
import { Play, CheckCircle, Mic } from "lucide-react";

interface VoiceSignoffProps {
  onSigned?: () => void;
}

export function VoiceSignoff({ onSigned }: VoiceSignoffProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [ended, setEnded] = useState(false);
  const [signed, setSigned] = useState(false);

  function handleSign() {
    setSigned(true);
    onSigned?.();
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
          src="/demo/sarah-send-it.mp3"
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

      {signed ? (
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: "rgba(0,196,140,0.08)" }}>
          <CheckCircle size={14} style={{ color: "var(--color-success)" }} />
          <p className="text-xs font-semibold" style={{ color: "var(--color-success)" }}>
            Signed — Sarah Chen, Co-founder & COO
          </p>
        </div>
      ) : (
        <button
          onClick={handleSign}
          disabled={!ended}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all"
          style={{
            background: ended ? "linear-gradient(135deg, #FF4B00, #FF7A40)" : "var(--color-gray-100)",
            color: ended ? "white" : "var(--color-gray-400)",
            cursor: ended ? "pointer" : "not-allowed",
            boxShadow: ended ? "0 4px 12px rgba(255,75,0,0.25)" : "none",
          }}
          aria-disabled={!ended}
        >
          <Play size={14} />
          Mark Signed
        </button>
      )}
    </div>
  );
}
