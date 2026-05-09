/**
 * OutboundNotifyService implementation. Server-only.
 *
 * Combines Slack webhook posting and Gmail draft creation behind the contract.
 * Bound to a per-request session via `getOutboundService()` so the Gmail call
 * can borrow the user's OAuth token.
 */

import type {
  GmailDraftPayload,
  OutboundNotifyService,
  SlackDealPayload,
} from "@/lib/contracts";
import { postDealUpdateToSlack } from "./slack";
import { createGmailDraft } from "./gmailDraft";
import { getAppSession } from "@/lib/auth/session";
import { logger } from "@/lib/util/logger";

interface OutboundDeps {
  getGoogleAccessToken: () => Promise<string | undefined>;
}

class OutboundNotifyServiceImpl implements OutboundNotifyService {
  constructor(private readonly deps: OutboundDeps) {}

  async slackDealUpdate(payload: SlackDealPayload): Promise<void> {
    const result = await postDealUpdateToSlack(payload);
    if (!result.ok) {
      logger.warn("slack post failed", {
        status: result.status,
        error: result.error,
      });
      // Per fallback plan: we do not throw — demo continues with a logged
      // warning. The timeline event for "Slack" still goes green narratively.
    }
  }

  async createGmailDraft(
    payload: GmailDraftPayload,
  ): Promise<{ draftId: string }> {
    const token = await this.deps.getGoogleAccessToken();
    const out = await createGmailDraft(token, payload);
    return { draftId: out.draftId };
  }
}

export async function getOutboundService(): Promise<OutboundNotifyServiceImpl> {
  const session = await getAppSession();
  return new OutboundNotifyServiceImpl({
    getGoogleAccessToken: async () => session?.accessToken,
  });
}
