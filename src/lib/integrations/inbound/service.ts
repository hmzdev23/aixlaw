/**
 * InboundService — concrete implementation of contracts/integration.ts §1.
 * Server-only.
 *
 * docs/tasks/07-will-inbound-auth.md acceptance:
 *   - Manual demo trigger works without Google on venue Wi-Fi.
 *   - With valid Google creds, fetching latest inbox returns InboundEvent.
 *   - Slack signature verification enforced upstream of handleSlackPayload.
 */

import type {
  DealSession,
  InboundDocumentFocus,
  InboundEvent,
  InboundService,
} from "@/lib/contracts";
import { resolvePersonaId } from "@/lib/personas";
import { newDealId, newInboundEventId } from "@/lib/util/ids";
import { logger } from "@/lib/util/logger";
import {
  fetchLatestRedlineMessage,
  watchGmail as gmailWatcher,
  type GmailMessageSummary,
} from "@/lib/integrations/google/gmail";
import {
  findNextHardStopLive,
  syntheticDemoHardStop,
} from "@/lib/integrations/google/calendar";
import { parseSlackPayload } from "@/lib/integrations/slack/handler";
import { buildDealSession } from "./dealSession";
import { rememberInboundEvent } from "./store";
import { FIXTURE_PATHS } from "@/lib/util/fixturePath";
import { env } from "@/lib/util/env";

interface InboundServiceDeps {
  /** Returns the current Google access token, or undefined when offline. */
  getGoogleAccessToken: () => Promise<string | undefined>;
  /** Returns the authenticated user's email when signed in. */
  getCurrentEmail: () => Promise<string | null>;
}

export class InboundServiceImpl implements InboundService {
  constructor(private readonly deps: InboundServiceDeps) {}

  async *watchGmail(): AsyncIterable<InboundEvent> {
    for await (const msg of gmailWatcher(this.deps.getGoogleAccessToken, {
      dealIdFactory: () => newDealId(),
    })) {
      const event = await this.toInboundEventFromGmail(msg);
      rememberInboundEvent(event);
      yield event;
    }
  }

  async fetchOnceFromGmail(): Promise<InboundEvent | null> {
    const token = await this.deps.getGoogleAccessToken();
    const dealId = newDealId();
    const msg = await fetchLatestRedlineMessage(token, { dealId });
    if (!msg) return null;
    const event = await this.toInboundEventFromGmail(msg, dealId);
    rememberInboundEvent(event);
    return event;
  }

  async handleSlackPayload(body: unknown): Promise<InboundEvent | null> {
    const parsed = parseSlackPayload(body);
    if (parsed.kind === "file_share") {
      const enriched = await this.attachCalendarContext(parsed.event);
      rememberInboundEvent(enriched);
      return enriched;
    }
    if (parsed.kind === "url_verification") {
      // The route returns the challenge directly; nothing to remember here.
      return null;
    }
    return null;
  }

  async triggerManualDemo(opts?: {
    documentFocus?: InboundDocumentFocus;
  }): Promise<InboundEvent> {
    const focus: InboundDocumentFocus = opts?.documentFocus ?? "msa";
    const dealId = newDealId();
    const personaId = resolvePersonaId(await this.deps.getCurrentEmail());

    const fixturePath =
      focus === "nda" ? FIXTURE_PATHS.ndaRedlined : FIXTURE_PATHS.msaRedlined;
    const subject =
      focus === "nda"
        ? "Initech NDA redlines — please review"
        : "Initech MSA v2 redlines — needs CEO sign-off tonight";

    const event: InboundEvent = {
      id: newInboundEventId(),
      source: "manual_demo",
      receivedAt: new Date().toISOString(),
      personaId,
      dealId,
      subject,
      attachments: [
        {
          name:
            focus === "nda"
              ? "Initech_NDA_redlines_v2.docx"
              : "Initech_MSA_redlines_v2.docx",
          mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          // Point straight at the Spellbook fixture path so downstream T8 can
          // open it without a separate download step.
          storageKey: `fixture://${fixturePath}`,
        },
      ],
      rawSnippet:
        focus === "nda"
          ? "Initech procurement converted the mutual NDA to one-way and stretched the survival to 5 years."
          : "Initech procurement returned the MSA with uncapped breach liability, convenience termination, IP on custom work, 24/7 support, audit and step-in.",
      documentFocus: focus,
    };

    const enriched = await this.attachCalendarContext(event);
    rememberInboundEvent(enriched);
    logger.info("inbound: manual demo trigger", {
      dealId,
      documentFocus: focus,
      personaId,
    });
    return enriched;
  }

  /** Build the DealSession for a previously remembered InboundEvent. */
  toDealSession(event: InboundEvent): DealSession {
    return buildDealSession({
      dealId: event.dealId,
      documentFocus: event.documentFocus,
    });
  }

  // ---------------------------------------------------------------------------
  // internals
  // ---------------------------------------------------------------------------

  private async toInboundEventFromGmail(
    msg: GmailMessageSummary,
    dealId: string = newDealId(),
  ): Promise<InboundEvent> {
    const email = msg.fromEmail ?? (await this.deps.getCurrentEmail());
    const event: InboundEvent = {
      id: newInboundEventId(),
      source: "gmail",
      receivedAt: new Date().toISOString(),
      personaId: resolvePersonaId(email),
      dealId,
      subject: msg.subject ?? undefined,
      attachments: msg.attachments,
      rawSnippet: msg.snippet ?? undefined,
      documentFocus: inferFocus(msg.subject ?? null, msg.attachments),
    };
    return this.attachCalendarContext(event);
  }

  private async attachCalendarContext(
    event: InboundEvent,
  ): Promise<InboundEvent> {
    const token = await this.deps.getGoogleAccessToken();
    if (token) {
      const live = await findNextHardStopLive(token, {});
      if (live) return { ...event, calendarContext: live };
    }
    if (env.isDemoMode()) {
      return { ...event, calendarContext: syntheticDemoHardStop() };
    }
    return event;
  }
}

function inferFocus(
  subject: string | null,
  attachments: { name: string }[],
): InboundDocumentFocus | undefined {
  const haystack = [
    subject ?? "",
    ...attachments.map((a) => a.name),
  ]
    .join(" ")
    .toLowerCase();
  if (haystack.includes("nda")) return "nda";
  if (haystack.includes("msa")) return "msa";
  return undefined;
}
