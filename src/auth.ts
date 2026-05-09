/**
 * NextAuth v5 (Auth.js) configuration. Server-only.
 *
 * Scope set per docs/tasks/07-will-inbound-auth.md §Auth:
 *   - openid email profile
 *   - https://www.googleapis.com/auth/gmail.readonly
 *   - https://www.googleapis.com/auth/gmail.compose   (T8 needs draft creation)
 *   - https://www.googleapis.com/auth/calendar.readonly
 *
 * The Google access_token + refresh_token are surfaced on `session` so the
 * Gmail/Calendar clients (src/lib/integrations/google/*) can reuse them
 * without a second sign-in.
 *
 * Demo bypass: when GAMBIT_DEMO_MODE=true, src/lib/auth/session.ts shortcuts
 * around NextAuth and returns a fake Sarah session. We still export a working
 * `auth()` here so live OAuth still works when the flag is off.
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { env } from "@/lib/util/env";

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

const providers: NextAuthConfig["providers"] = [];

if (env.hasGoogleOAuth()) {
  providers.push(
    Google({
      clientId: env.googleClientId(),
      clientSecret: env.googleClientSecret(),
      authorization: {
        params: {
          scope: GOOGLE_SCOPES,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  secret: env.nextAuthSecret() || "demo-only-not-secure",
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // First sign-in: capture the Google tokens onto the JWT.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt =
          typeof account.expires_at === "number"
            ? account.expires_at
            : undefined;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      session.refreshToken =
        typeof token.refreshToken === "string" ? token.refreshToken : undefined;
      session.expiresAt =
        typeof token.expiresAt === "number" ? token.expiresAt : undefined;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
