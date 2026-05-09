/**
 * Gmail draft creator. Server-only.
 *
 * Uses Gmail API users.drafts.create with raw multipart MIME. The Gmail
 * client lib's typed `messages.send` insists on a String `raw` field; the
 * spec says the same applies to drafts.
 *
 * Multipart MIME structure:
 *   multipart/mixed
 *     ├─ text/plain (the body text)
 *     └─ application/...; name=<filename> (the attached docx, base64-encoded)
 *
 * The "From" address is whatever the OAuth-signed-in user is — we do not need
 * to set it explicitly; Gmail uses the authenticated user identity.
 */

import { google } from "googleapis";
import { Buffer } from "node:buffer";
import { buildOAuthClient, GoogleNotAuthedError } from "../google/client";
import type { GmailDraftPayload } from "@/lib/contracts";

export interface GmailDraftResult {
  draftId: string;
  threadId?: string | null;
  messageId?: string | null;
}

export async function createGmailDraft(
  accessToken: string | undefined,
  payload: GmailDraftPayload,
): Promise<GmailDraftResult> {
  if (!accessToken) throw new GoogleNotAuthedError();

  const auth = buildOAuthClient(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  const raw = buildRawMultipart(payload);

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: {
        raw,
      },
    },
  });

  const draftId = res.data.id;
  if (!draftId) {
    throw new Error("Gmail draft creation returned no draft id");
  }
  return {
    draftId,
    threadId: res.data.message?.threadId ?? null,
    messageId: res.data.message?.id ?? null,
  };
}

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------

function buildRawMultipart(payload: GmailDraftPayload): string {
  const boundary = `gambit_${Date.now().toString(36)}_${Math.floor(
    Math.random() * 1e9,
  ).toString(36)}`;

  const headers = [
    `To: ${payload.to}`,
    "MIME-Version: 1.0",
    `Subject: ${encodeMimeHeader(payload.subject)}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
  ];

  const parts: string[] = [];

  // Body part.
  parts.push(
    [
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 7bit",
      "",
      payload.body,
    ].join("\r\n"),
  );

  // Attachment part (optional).
  if (payload.attachment) {
    const b64 = Buffer.from(payload.attachment.bytes).toString("base64");
    const wrapped = b64.match(/.{1,76}/g)?.join("\r\n") ?? b64;
    parts.push(
      [
        `--${boundary}`,
        `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document; name="${payload.attachment.filename}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${payload.attachment.filename}"`,
        "",
        wrapped,
      ].join("\r\n"),
    );
  }

  parts.push(`--${boundary}--`);

  const mime = `${headers.join("\r\n")}\r\n\r\n${parts.join("\r\n")}`;
  // Gmail expects URL-safe base64 (RFC 4648 §5).
  return Buffer.from(mime).toString("base64url");
}

function encodeMimeHeader(value: string): string {
  // Subject lines may contain accents (FR mode) — wrap with RFC 2047 encoded-word
  // when non-ASCII present.
  // eslint-disable-next-line no-control-regex
  if (!/[^\x00-\x7F]/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}
