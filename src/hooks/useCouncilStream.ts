"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  CouncilResult,
  CouncilRole,
  DebateEvent,
  VoteValue,
} from "@/lib/contracts/models";
import { streamNdjson } from "@/lib/api/ndjson";

type CouncilLine = DebateEvent | { kind: "result"; result: CouncilResult };

const COUNCIL_ROLES: readonly CouncilRole[] = [
  "counsel",
  "closer",
  "counterpart",
  "compliance",
  "crown",
] as const;

function isCouncilRole(agent: string): agent is CouncilRole {
  return (COUNCIL_ROLES as readonly string[]).includes(agent);
}

export function useCouncilStream(dealId: string, initialMoveId = "n_a_brilliant") {
  const [moveId, setMoveId] = useState(initialMoveId);
  const [events, setEvents] = useState<DebateEvent[]>([]);
  const [result, setResult] = useState<CouncilResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const votes = useMemo(() => {
    const out: Partial<Record<CouncilRole, VoteValue>> = {};
    for (const ev of events) {
      if (ev.vote && isCouncilRole(ev.agent)) out[ev.agent] = ev.vote;
    }
    return out;
  }, [events]);

  const influences = useMemo(() => {
    const out: Record<CouncilRole, number> = {
      counsel: 0,
      closer: 0,
      counterpart: 0,
      compliance: 0,
      crown: 0,
    };
    for (const ev of events) {
      if (typeof ev.influenceDelta === "number" && isCouncilRole(ev.agent)) {
        out[ev.agent] += ev.influenceDelta;
      }
    }
    return out;
  }, [events]);

  const activeAgent = useMemo(() => {
    const last = events.at(-1)?.agent;
    return last && isCouncilRole(last) ? last : undefined;
  }, [events]);

  const start = useCallback(
    async (nextMoveId = moveId) => {
      setMoveId(nextMoveId);
      setEvents([]);
      setResult(null);
      setError(null);
      setRunning(true);
      try {
        await streamNdjson<CouncilLine>(
          "/api/engine/council",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dealId, moveId: nextMoveId }),
          },
          (line) => {
            if ("kind" in line && line.kind === "result") {
              setResult(line.result);
            } else {
              setEvents((prev) => [...prev, line as DebateEvent]);
            }
          },
        );
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setRunning(false);
      }
    },
    [dealId, moveId],
  );

  return {
    activeAgent,
    error,
    events,
    influences,
    moveId,
    result,
    running,
    setMoveId,
    start,
    votes,
  };
}
