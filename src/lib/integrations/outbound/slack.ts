/**
 * Slack outbound notifier. Server-only.
 *
 * Posts to SLACK_WEBHOOK_URL using the Incoming Webhook contract. Locale-aware
 * default copy is bundled here; the caller can override per call.
 *
 * Acceptance criterion (08 §Slack outbound): "Slack message receives within 2s
 * of call". We use fetch with a 2s AbortController to fail fast.
 */

import type { SlackDealPayload } from "@/lib/contracts";
import { env } from "@/lib/util/env";
import { logger } from "@/lib/util/logger";

const FETCH_TIMEOUT_MS = 2000;

export interface SlackPostResult {
  ok: boolean;
  status: number;
  bodyExcerpt?: string;
  error?: string;
}

export async function postDealUpdateToSlack(
  payload: SlackDealPayload,
): Promise<SlackPostResult> {
  const url = env.slackWebhookUrl();
  if (!url) {
    logger.warn("slack webhook not configured; skipping post");
    return { ok: false, status: 503, error: "slack_webhook_not_configured" };
  }

  const body = buildBlocks(payload);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        bodyExcerpt: text.slice(0, 200),
        error: "slack_post_failed",
      };
    }
    return { ok: true, status: res.status, bodyExcerpt: text.slice(0, 50) };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: (err as Error).name === "AbortError" ? "timeout" : "network_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

function buildBlocks(payload: SlackDealPayload): unknown {
  const headerLine =
    payload.locale === "fr"
      ? `:rocket: Mise à jour Gambit — ${payload.title}`
      : `:rocket: Gambit deal update — ${payload.title}`;
  const dealLine =
    payload.locale === "fr"
      ? `Affaire \`${payload.dealId}\``
      : `Deal \`${payload.dealId}\``;

  return {
    text: `${headerLine}\n${payload.body}`,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `*${headerLine}*` },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: dealLine }],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: payload.body },
      },
    ],
  };
}
