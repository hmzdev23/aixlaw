/**
 * App-level session resolver. Use this from API routes and server components
 * instead of importing `auth()` directly — it adds two things on top:
 *
 *   1. GAMBIT_DEMO_MODE bypass returning a fake Sarah session (no OAuth).
 *   2. personaId resolution from email -> personas.json + env overrides.
 *
 * Server-only.
 */

import { auth } from "@/auth";
import { demoPersona, resolvePersonaId } from "@/lib/personas";
import { env } from "@/lib/util/env";
import type { Persona } from "@/lib/contracts";

export interface AppSession {
  email: string | null;
  personaId: string;
  persona: Persona | undefined;
  /** Google access_token, present only when live-OAuth signed in. */
  accessToken: string | undefined;
  refreshToken: string | undefined;
  expiresAt: number | undefined;
  /** True when this session was synthesized by GAMBIT_DEMO_MODE. */
  isDemo: boolean;
}

export async function getAppSession(): Promise<AppSession | null> {
  if (env.isDemoMode()) {
    const persona = demoPersona();
    return {
      email: persona.email,
      personaId: persona.id,
      persona,
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
      isDemo: true,
    };
  }

  if (!env.hasGoogleOAuth()) {
    // No demo flag and no Google creds — there's no way to sign in. Return null
    // so callers can render a "configure OAuth" hint instead of crashing.
    return null;
  }

  const session = await auth();
  if (!session?.user?.email) return null;

  const personaId = resolvePersonaId(session.user.email);
  return {
    email: session.user.email,
    personaId,
    persona: undefined, // hydrated by callers via getPersona() if needed
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    isDemo: false,
  };
}

/** Throws 401-shaped errors for routes that require a live session. */
export async function requireAppSession(): Promise<AppSession> {
  const s = await getAppSession();
  if (!s) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return s;
}
