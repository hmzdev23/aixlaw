/**
 * Persona registry. Server-only.
 *
 * Backing data: src/lib/fixtures/personas.json (validated on load).
 * Resolution chain for an authenticated email:
 *   1. Check DEMO_EMAIL_* env overrides (highest precedence — lets ops point a
 *      real Gmail account at a demo persona without changing JSON).
 *   2. Match the email against personas.json `email` (case-insensitive).
 *   3. Fall back to "persona_sarah" so the demo never breaks on an unknown SSO.
 */

import { z } from "zod";
import type { Persona, PersonaRole } from "@/lib/contracts";
import raw from "@/lib/fixtures/personas.json";
import { env } from "@/lib/util/env";

const personaRoles: readonly PersonaRole[] = [
  "cofounder_coo",
  "ae",
  "gc",
  "counterparty_legal",
  "ceo",
  "demo_admin",
] as const;

const PersonaSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(personaRoles as [PersonaRole, ...PersonaRole[]]),
  org: z.string().min(1),
  avatarUrl: z.string().url().optional(),
});

const PersonasFileSchema = z.object({
  personas: z.array(PersonaSchema).min(1),
});

const parsed = PersonasFileSchema.parse(raw);
const personas: readonly Persona[] = Object.freeze(parsed.personas);

/** Default persona used when no resolution matches. Sarah is the protagonist. */
export const DEFAULT_PERSONA_ID = "persona_sarah" as const;

export function listPersonas(): readonly Persona[] {
  return personas;
}

export function getPersona(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

/** Resolve an authenticated email to a personaId. */
export function resolvePersonaId(email: string | null | undefined): string {
  if (!email) return DEFAULT_PERSONA_ID;
  const normalized = email.toLowerCase();
  const envMap = env.personaEmailMap();
  if (envMap[normalized]) return envMap[normalized];
  const direct = personas.find((p) => p.email.toLowerCase() === normalized);
  return direct?.id ?? DEFAULT_PERSONA_ID;
}

/** Persona used when GAMBIT_DEMO_MODE=true (no Google session present). */
export function demoPersona(): Persona {
  const sarah = getPersona(DEFAULT_PERSONA_ID);
  if (!sarah) {
    // Should be unreachable — schema parse guarantees Sarah is in fixtures.
    throw new Error("personas.json missing default persona Sarah");
  }
  return sarah;
}
