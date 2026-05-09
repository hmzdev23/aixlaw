"use client";

import { useCallback } from "react";
import { apiGetJson, apiPostJson } from "@/lib/api/client";
import { useApi } from "@/hooks/useApi";
import type { Decision, Playbook, PlaybookSummary } from "@/lib/contracts/models";

export function usePlaybookList() {
  return useApi<PlaybookSummary[]>("/api/playbooks");
}

export function usePlaybookApi(id: string | null) {
  const playbook = useApi<Playbook>(id ? `/api/playbooks/${encodeURIComponent(id)}` : null);

  const load = useCallback((nextId: string) => {
    return apiGetJson<Playbook>(`/api/playbooks/${encodeURIComponent(nextId)}`);
  }, []);

  const save = useCallback(async (next: Playbook) => {
    return apiPostJson<Playbook>("/api/playbooks", next);
  }, []);

  const execute = useCallback(async (playbookId: string, dealId: string) => {
    return apiPostJson<Decision>(`/api/playbooks/${encodeURIComponent(playbookId)}/execute`, {
      dealId,
    });
  }, []);

  return { ...playbook, execute, load, save };
}
