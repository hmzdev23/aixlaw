/**
 * InboundService factory. Bound to the current request's session so the
 * Gmail/Calendar clients can borrow the access token without a re-fetch.
 *
 * Routes call `getInboundService()` per request.
 */

import { getAppSession } from "@/lib/auth/session";
import { InboundServiceImpl } from "./service";

export async function getInboundService(): Promise<InboundServiceImpl> {
  const session = await getAppSession();
  return new InboundServiceImpl({
    getGoogleAccessToken: async () => session?.accessToken,
    getCurrentEmail: async () => session?.email ?? null,
  });
}
