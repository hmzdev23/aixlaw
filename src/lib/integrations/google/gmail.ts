/**
 * Gmail polling watcher + classifier glue. Server-only.
 *
 * docs/tasks/07-will-inbound-auth.md §"Gmail watcher":
 *   - Polling users.messages.list + get every N seconds (Pub/Sub is stretch).
 *   - Classifier: attachment .docx mime OR subject regex (?i)redline|MSA|comments
 *   - Upload attachment to Vercel Blob / local tmp/ for processing key.
 *
 * For the hackathon we keep the storage layer simple: attachments are written
 * to `data/inbound/<dealId>/<attachmentId>` on the local fs. Vercel Blob can
 * swap in later behind the same `storeAttachment` interface — only this file
 * changes.
 */

import { google, gmail_v1 } from "googleapis";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";
import { buildOAuthClient, GoogleNotAuthedError } from "./client";
import type { InboundAttachment } from "@/lib/contracts";
import { logger } from "@/lib/util/logger";
import { env } from "@/lib/util/env";

const REDLINE_SUBJECT_REGEX = /(redline|MSA|NDA|comments)/i;
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export interface GmailMessageSummary {
  messageId: string;
  threadId: string;
  fromEmail: string | null;
  subject: string | null;
  snippet: string | null;
  attachments: InboundAttachment[];
}

interface ClassifierResult {
  isRedline: boolean;
  reason: string;
}

/** Subject + attachment heuristics. No LLM call (T7 keeps it deterministic). */
export function classifyGmailMessage(input: {
  subject: string | null;
  attachments: { name: string; mime: string }[];
}): ClassifierResult {
  if (input.attachments.some((a) => a.mime === DOCX_MIME)) {
    return { isRedline: true, reason: "attachment_docx" };
  }
  if (input.subject && REDLINE_SUBJECT_REGEX.test(input.subject)) {
    return { isRedline: true, reason: "subject_match" };
  }
  return { isRedline: false, reason: "no_match" };
}

/** Decode a Gmail header list into a lookup. */
function indexHeaders(
  headers: { name?: string | null; value?: string | null }[] | null | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) return out;
  for (const h of headers) {
    if (h.name && h.value) out[h.name.toLowerCase()] = h.value;
  }
  return out;
}

function extractEmail(addr: string | undefined): string | null {
  if (!addr) return null;
  // "Sarah Chen <sarah@dunderai.demo>" -> "sarah@dunderai.demo"
  const match = /<([^>]+)>/.exec(addr);
  return (match?.[1] ?? addr).trim() || null;
}

interface AttachmentRef {
  filename: string;
  mimeType: string;
  attachmentId: string;
  size: number;
}

function collectAttachments(
  parts: gmail_v1.Schema$MessagePart[] | undefined | null,
  acc: AttachmentRef[] = [],
): AttachmentRef[] {
  if (!parts) return acc;
  for (const p of parts) {
    if (p.filename && p.body?.attachmentId) {
      acc.push({
        filename: p.filename,
        mimeType: p.mimeType ?? "application/octet-stream",
        attachmentId: p.body.attachmentId,
        size: typeof p.body.size === "number" ? p.body.size : 0,
      });
    }
    if (p.parts) collectAttachments(p.parts, acc);
  }
  return acc;
}

async function getMessageRaw(
  gmail: ReturnType<typeof google.gmail>,
  messageId: string,
) {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  return res.data;
}

async function downloadAttachment(
  gmail: ReturnType<typeof google.gmail>,
  messageId: string,
  attachmentId: string,
): Promise<Buffer> {
  const res = await gmail.users.messages.attachments.get({
    userId: "me",
    messageId,
    id: attachmentId,
  });
  const data = res.data.data;
  if (!data) throw new Error("attachment body empty");
  return Buffer.from(data, "base64url");
}

async function storeAttachmentBytes(
  dealId: string,
  filename: string,
  bytes: Buffer,
): Promise<string> {
  const dir = path.join(process.cwd(), "data", "inbound", dealId);
  await fs.mkdir(dir, { recursive: true });
  // Sanitize the filename — strip path separators, NULs.
  const safe = filename.replace(/[\\/\0]/g, "_").slice(0, 200);
  const dest = path.join(dir, safe);
  await fs.writeFile(dest, bytes);
  // The storageKey is repo-relative for portability across local/Vercel.
  return path.relative(process.cwd(), dest);
}

export interface FetchLatestOpts {
  /** Gmail search query. Default targets unread inbox messages. */
  query?: string;
  maxResults?: number;
  /** Deal id used for attachment storage path. */
  dealId: string;
}

/**
 * One-shot fetch of the most recent message matching `query`. Returns null if
 * the inbox is empty or nothing matches. Errors bubble up to the caller.
 */
export async function fetchLatestRedlineMessage(
  accessToken: string | undefined,
  opts: FetchLatestOpts,
): Promise<GmailMessageSummary | null> {
  if (!accessToken) throw new GoogleNotAuthedError();

  const auth = buildOAuthClient(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    q: opts.query ?? "is:unread (subject:redline OR subject:MSA OR has:attachment)",
    maxResults: opts.maxResults ?? 5,
  });
  const ids = (list.data.messages ?? []).map((m) => m.id).filter(Boolean) as string[];
  if (ids.length === 0) return null;

  const maxAttachments = env.gmailMaxAttachments();

  for (const id of ids) {
    const msg = await getMessageRaw(gmail, id);
    if (!msg.payload) continue;
    const headers = indexHeaders(msg.payload.headers ?? []);
    const subject = headers["subject"] ?? null;
    const attachments = collectAttachments(msg.payload.parts ?? null).slice(
      0,
      maxAttachments,
    );

    const verdict = classifyGmailMessage({
      subject,
      attachments: attachments.map((a) => ({
        name: a.filename,
        mime: a.mimeType,
      })),
    });
    if (!verdict.isRedline) continue;

    const stored: InboundAttachment[] = [];
    for (const a of attachments) {
      try {
        const bytes = await downloadAttachment(gmail, id, a.attachmentId);
        const key = await storeAttachmentBytes(opts.dealId, a.filename, bytes);
        stored.push({ name: a.filename, mime: a.mimeType, storageKey: key });
      } catch (err) {
        logger.warn("gmail attachment fetch failed", {
          messageId: id,
          attachment: a.filename,
          err: (err as Error).message,
        });
      }
    }

    return {
      messageId: id,
      threadId: msg.threadId ?? id,
      fromEmail: extractEmail(headers["from"]),
      subject,
      snippet: msg.snippet ?? null,
      attachments: stored,
    };
  }

  return null;
}

/**
 * Long-running async generator: polls Gmail every N seconds and yields each
 * new redline message. Caller controls cancellation by breaking the for-await
 * loop; we honor that via an internal flag.
 *
 * NOTE: Vercel serverless functions are short-lived. This generator is
 * intended for local `next dev` rehearsal and a future worker. Production-grade
 * polling needs Pub/Sub (out of scope for T7).
 */
export async function* watchGmail(
  getAccessToken: () => Promise<string | undefined>,
  opts: { dealIdFactory: () => string; intervalSeconds?: number } = {
    dealIdFactory: () => "deal_unknown",
  },
): AsyncIterable<GmailMessageSummary> {
  const interval = (opts.intervalSeconds ?? env.gmailPollSeconds()) * 1000;
  const seen = new Set<string>();

  while (true) {
    try {
      const token = await getAccessToken();
      if (!token) {
        logger.debug("watchGmail: no access token; sleeping");
      } else {
        const msg = await fetchLatestRedlineMessage(token, {
          dealId: opts.dealIdFactory(),
        });
        if (msg && !seen.has(msg.messageId)) {
          seen.add(msg.messageId);
          yield msg;
        }
      }
    } catch (err) {
      logger.warn("watchGmail iteration error", {
        err: (err as Error).message,
      });
    }
    await new Promise((r) => setTimeout(r, interval));
  }
}
