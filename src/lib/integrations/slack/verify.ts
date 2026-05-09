/**
 * Slack request signature verification. Server-only.
 *
 * https://api.slack.com/authentication/verifying-requests-from-slack
 *
 * Algorithm:
 *   1. Read X-Slack-Request-Timestamp + raw body.
 *   2. Reject if timestamp older than 5 minutes (anti-replay).
 *   3. base = `v0:${ts}:${rawBody}`
 *   4. expected = "v0=" + HMAC_SHA256(signingSecret, base)
 *   5. Compare against X-Slack-Signature using timingSafeEqual.
 */

import crypto from "node:crypto";

const FIVE_MINUTES_SEC = 60 * 5;

export interface SlackVerifyInput {
  rawBody: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  signingSecret: string;
  /** Override the clock for tests. Unix seconds. */
  nowSec?: number;
}

export type SlackVerifyResult =
  | { ok: true }
  | { ok: false; reason: string };

export function verifySlackSignature(input: SlackVerifyInput): SlackVerifyResult {
  if (!input.timestampHeader || !input.signatureHeader) {
    return { ok: false, reason: "missing_headers" };
  }
  const ts = Number(input.timestampHeader);
  if (!Number.isFinite(ts)) {
    return { ok: false, reason: "bad_timestamp" };
  }
  const now = input.nowSec ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > FIVE_MINUTES_SEC) {
    return { ok: false, reason: "timestamp_skew" };
  }
  const base = `v0:${input.timestampHeader}:${input.rawBody}`;
  const mac = crypto
    .createHmac("sha256", input.signingSecret)
    .update(base)
    .digest("hex");
  const expected = `v0=${mac}`;
  const sigBuf = Buffer.from(input.signatureHeader);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) {
    return { ok: false, reason: "signature_mismatch" };
  }
  const match = crypto.timingSafeEqual(sigBuf, expBuf);
  return match ? { ok: true } : { ok: false, reason: "signature_mismatch" };
}
