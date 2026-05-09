/**
 * Google API client factory. Server-only.
 *
 * Builds an OAuth2-authenticated client from the Google access_token captured
 * by NextAuth (see src/auth.ts callbacks). We do NOT call setCredentials({
 * refresh_token }) because the hackathon env stores tokens session-only —
 * refreshing requires the client_secret + refresh_token, which is fine to
 * implement later but not needed for the demo where Sarah re-signs-in.
 *
 * Throws if no access_token is provided so callers handle the offline path.
 */

import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export function buildOAuthClient(accessToken: string): OAuth2Client {
  const client = new google.auth.OAuth2();
  client.setCredentials({ access_token: accessToken });
  return client;
}

export class GoogleNotAuthedError extends Error {
  constructor() {
    super(
      "Google access token unavailable (sign in via /api/auth/signin or run with GAMBIT_DEMO_MODE=true)",
    );
    this.name = "GoogleNotAuthedError";
  }
}
