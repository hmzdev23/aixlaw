"use client";

import { useState, useRef, useEffect } from "react";
import { usePersonaId, DEMO_PERSONAS } from "@/contexts/PersonaContext";
import { ChevronDown, User } from "lucide-react";

export function PersonaSwitcher() {
  const { persona, setPersonaId } = usePersonaId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        style={{ borderColor: "var(--color-gray-200)", color: "var(--color-gray-900)" }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <User size={14} style={{ color: "var(--color-brand)" }} />
        <span className="hidden sm:inline max-w-[120px] truncate">{persona.displayName}</span>
        <ChevronDown size={12} style={{ color: "var(--color-gray-400)" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl z-50"
          style={{ background: "white", borderColor: "var(--color-gray-200)" }}
          role="listbox"
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-400)" }}>
            Demo Persona
          </div>
          {DEMO_PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPersonaId(p.id); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 flex flex-col"
              style={{ color: persona.id === p.id ? "var(--color-brand)" : "var(--color-gray-900)" }}
              role="option"
              aria-selected={persona.id === p.id}
            >
              <span className="font-medium">{p.displayName}</span>
              <span className="text-xs" style={{ color: "var(--color-gray-400)" }}>{p.org}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
