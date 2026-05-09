"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Persona } from "@/lib/contracts/models";

export const DEMO_PERSONAS: Persona[] = [
  {
    id: "persona_sarah",
    displayName: "Sarah Chen",
    email: "sarah@dunderai.demo",
    role: "cofounder_coo",
    org: "Dunder AI Inc.",
    avatarUrl: undefined,
  },
  {
    id: "persona_marc",
    displayName: "Marc Tremblay",
    email: "marc@dunderai.demo",
    role: "gc",
    org: "Dunder AI Inc.",
    avatarUrl: undefined,
  },
  {
    id: "persona_initech",
    displayName: "Initech Procurement Counsel",
    email: "procurement-legal@initechfg.demo",
    role: "counterparty_legal",
    org: "Initech Financial Group Inc.",
    avatarUrl: undefined,
  },
];

const STORAGE_KEY = "gambit_persona";

interface PersonaContextValue {
  persona: Persona;
  personaId: string;
  setPersonaId: (id: string) => void;
  personas: Persona[];
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaIdState] = useState<string>("persona_sarah");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DEMO_PERSONAS.find((p) => p.id === saved)) {
      setPersonaIdState(saved);
    }
  }, []);

  function setPersonaId(id: string) {
    setPersonaIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  const persona = DEMO_PERSONAS.find((p) => p.id === personaId) ?? DEMO_PERSONAS[0];

  return (
    <PersonaContext.Provider value={{ persona, personaId, setPersonaId, personas: DEMO_PERSONAS }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersonaId() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersonaId must be used within PersonaProvider");
  return ctx;
}
