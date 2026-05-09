import { DUNDER } from "./dunder";
import { NIMBUS } from "./nimbus";
import type { Scenario, ScenarioId, ScenarioDecisionOption } from "./types";

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  dunder: DUNDER,
  nimbus: NIMBUS,
};

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS[id];
}

/**
 * Detect which scenario a freshly-uploaded document belongs to. Tries the
 * filename first (most reliable), then the document text.
 */
export function detectScenario(
  filename: string,
  text: string,
): ScenarioId {
  const fnLc = filename.toLowerCase();
  const textLc = text.toLowerCase();
  for (const sid of Object.keys(SCENARIOS) as ScenarioId[]) {
    const s = SCENARIOS[sid];
    if (s.filenameMarkers.some((m) => fnLc.includes(m))) return sid;
  }
  for (const sid of Object.keys(SCENARIOS) as ScenarioId[]) {
    const s = SCENARIOS[sid];
    if (s.filenameMarkers.some((m) => textLc.includes(m))) return sid;
  }
  return "dunder"; // sensible default for the demo
}

/**
 * Walk a path of decision option ids through the tree; return the option at
 * the end of the path plus the children options to choose from next.
 *
 * If `path` is empty, returns the root list.
 */
export function getOptionsAt(
  scenario: Scenario,
  path: string[],
): { current: ScenarioDecisionOption | null; next: ScenarioDecisionOption[] } {
  if (path.length === 0) {
    return { current: null, next: scenario.decisionRoot };
  }
  let level = scenario.decisionRoot;
  let current: ScenarioDecisionOption | null = null;
  for (const id of path) {
    const found = level.find((o) => o.id === id);
    if (!found) return { current, next: [] };
    current = found;
    level = found.children ?? [];
  }
  return { current, next: level };
}

export type { Scenario, ScenarioId, ScenarioDecisionOption } from "./types";
export type { ScenarioParagraph, ScenarioAgentBrief } from "./types";
