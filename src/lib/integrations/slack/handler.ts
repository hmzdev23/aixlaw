/**
 * Slack Events API payload parser. Server-only.
 *
 * Handles two payload classes we care about for T7:
 *   - URL verification challenge (one-time on app install).
 *   - file_share events (where Initech procurement "drops" the redline).
 *
 * Anything else returns null and the route logs/ignores it.
 */

import { z } from "zod";
import type { InboundEvent } from "@/lib/contracts";
import { newDealId, newInboundEventId } from "@/lib/util/ids";
import { resolvePersonaId } from "@/lib/personas";

const UrlVerificationSchema = z.object({
  type: z.literal("url_verification"),
  challenge: z.string().min(1),
});

const FileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  mimetype: z.string().optional(),
  url_private: z.string().optional(),
  filetype: z.string().optional(),
});

const FileShareEventSchema = z.object({
  type: z.literal("event_callback"),
  team_id: z.string().optional(),
  event: z.object({
    type: z.literal("message"),
    subtype: z.literal("file_share"),
    user: z.string().optional(),
    text: z.string().optional(),
    files: z.array(FileSchema).min(1),
    ts: z.string(),
    channel: z.string().optional(),
  }),
});

export type SlackPayload =
  | { kind: "url_verification"; challenge: string }
  | { kind: "file_share"; event: InboundEvent }
  | { kind: "ignored" };

export function parseSlackPayload(body: unknown): SlackPayload {
  const urlV = UrlVerificationSchema.safeParse(body);
  if (urlV.success) {
    return { kind: "url_verification", challenge: urlV.data.challenge };
  }

  const fileShare = FileShareEventSchema.safeParse(body);
  if (fileShare.success) {
    const inner = fileShare.data.event;
    const dealId = newDealId();
    const tsMs = Math.round(Number(inner.ts) * 1000);
    const receivedAt = Number.isFinite(tsMs)
      ? new Date(tsMs).toISOString()
      : new Date().toISOString();
    const event: InboundEvent = {
      id: newInboundEventId(),
      source: "slack",
      receivedAt,
      personaId: resolvePersonaId(null), // Slack doesn't give us an email here.
      dealId,
      subject: inner.text?.slice(0, 200),
      attachments: inner.files.map((f) => ({
        name: f.name ?? f.id,
        mime: f.mimetype ?? "application/octet-stream",
        // We don't download Slack files in T7 — the URL is opaque without a
        // bot token. Store the URL as the storageKey so a follow-up worker
        // (or T8 outbound flow) can fetch it.
        storageKey: f.url_private ?? `slack://${f.id}`,
      })),
      rawSnippet: inner.text,
    };
    return { kind: "file_share", event };
  }

  return { kind: "ignored" };
}
