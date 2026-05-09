"use client";

import { useCallback } from "react";
import { apiGetJson, apiPostJson } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import type { SignoffState } from "@/lib/contracts";

export interface SignoffPayload {
  state: {
    state: SignoffState;
    signedBy?: string;
  };
}

export function useSignoff(dealId: string) {
  const path = `/api/signoff/state?dealId=${encodeURIComponent(dealId)}`;
  const swr = useApi<SignoffPayload>(path, { refreshInterval: 1500 });

  const start = useCallback(async () => {
    const data = await apiPostJson<SignoffPayload>("/api/signoff/start", { dealId });
    await swr.mutate(data, { revalidate: false });
    return data;
  }, [dealId, swr]);

  const complete = useCallback(async (approved: boolean) => {
    const data = await apiPostJson<SignoffPayload>("/api/signoff/complete", {
      dealId,
      approved,
    });
    await swr.mutate(data, { revalidate: false });
    return data;
  }, [dealId, swr]);

  const refresh = useCallback(() => apiGetJson<SignoffPayload>(path), [path]);

  return { ...swr, complete, refresh, start };
}
