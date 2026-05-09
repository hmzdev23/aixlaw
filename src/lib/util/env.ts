/**
 * Centralized env access. Throws on missing required vars at first read.
 * Optional vars return undefined.
 *
 * Why: avoids `process.env.X!` non-null assertions scattered around the codebase
 * and gives one place to override during tests.
 */

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

function requireEnv(name: string): string {
  const v = read(name);
  if (!v) {
    throw new Error(
      `Missing required env var: ${name}. Did you copy .env.example to .env.local?`,
    );
  }
  return v;
}

export const env = {
  /** Demo bypass for hostile Wi-Fi / offline rehearsal. */
  isDemoMode(): boolean {
    return read("GAMBIT_DEMO_MODE") === "true";
  },
  // --- NextAuth -----------------------------------------------------------
  nextAuthSecret(): string {
    return read("AUTH_SECRET") ?? read("NEXTAUTH_SECRET") ?? "";
  },
  googleClientId(): string | undefined {
    return read("GOOGLE_CLIENT_ID");
  },
  googleClientSecret(): string | undefined {
    return read("GOOGLE_CLIENT_SECRET");
  },
  hasGoogleOAuth(): boolean {
    return Boolean(read("GOOGLE_CLIENT_ID") && read("GOOGLE_CLIENT_SECRET"));
  },
  // --- Persona email map --------------------------------------------------
  personaEmailMap(): Record<string, string> {
    const map: Record<string, string> = {};
    const sarah = read("DEMO_EMAIL_SARAH");
    const marc = read("DEMO_EMAIL_MARC");
    const initech = read("DEMO_EMAIL_INITECH");
    if (sarah) map[sarah.toLowerCase()] = "persona_sarah";
    if (marc) map[marc.toLowerCase()] = "persona_marc";
    if (initech) map[initech.toLowerCase()] = "persona_initech";
    return map;
  },
  initechEmail(): string {
    return read("DEMO_EMAIL_INITECH") ?? "procurement-legal@initechfg.demo";
  },
  // --- Slack --------------------------------------------------------------
  slackSigningSecret(): string | undefined {
    return read("SLACK_SIGNING_SECRET");
  },
  slackWebhookUrl(): string | undefined {
    return read("SLACK_WEBHOOK_URL");
  },
  // --- Gmail polling knobs ------------------------------------------------
  gmailPollSeconds(): number {
    const raw = read("GAMBIT_GMAIL_POLL_SECONDS");
    const n = raw ? Number(raw) : 15;
    return Number.isFinite(n) && n > 0 ? n : 15;
  },
  gmailMaxAttachments(): number {
    const raw = read("GAMBIT_GMAIL_MAX_ATTACHMENTS");
    const n = raw ? Number(raw) : 5;
    return Number.isFinite(n) && n > 0 ? n : 5;
  },
  // --- Hard-required helpers ---------------------------------------------
  requireSlackSigningSecret(): string {
    return requireEnv("SLACK_SIGNING_SECRET");
  },
  requireSlackWebhookUrl(): string {
    return requireEnv("SLACK_WEBHOOK_URL");
  },
};
