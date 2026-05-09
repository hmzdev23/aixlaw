"use client";

import { useCallback, useState } from "react";
import type { DebateEvent } from "@/lib/contracts/models";
import { streamNdjson } from "@/lib/api/ndjson";

const DEFAULT_CLAUSE =
  "MSA §7.1: Vendor liability for data breach and confidentiality claims is uncapped, while all other claims are capped at 12 months of fees.";

export function useAiVsAiStream(clauseText = DEFAULT_CLAUSE) {
  const [events, setEvents] = useState<DebateEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setEvents([]);
    setError(null);
    setRunning(true);
    try {
      await streamNdjson<DebateEvent>(
        "/api/engine/aivsai",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clauseText,
            leftGhostId: "initech_procurement",
            rightGhostId: "dunder_founder",
            maxRounds: 6,
          }),
        },
        (line) => setEvents((prev) => [...prev, line]),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }, [clauseText]);

  return { clauseText, error, events, running, start };
}
