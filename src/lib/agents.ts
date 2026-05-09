import type { AgentDef } from "./types";

/**
 * The five named council agents. Friendly French/English names with a clear
 * speciality so the user knows what each one watches over.
 */
export const AGENTS: AgentDef[] = [
  {
    id: "pierre",
    name: "Pierre",
    role: "Counsel",
    speciality: "contract law & precedent",
    blurb:
      "Reads the contract clause-by-clause; flags risk and proposes precise legal redlines.",
    emoji: "P",
  },
  {
    id: "marie",
    name: "Marie",
    role: "Compliance",
    speciality: "Quebec Law 25, PIPEDA, OSFI B-13",
    blurb:
      "Watches for personal-info, cross-border, and regulator-triggering clauses.",
    emoji: "M",
  },
  {
    id: "etienne",
    name: "Étienne",
    role: "Closer",
    speciality: "commercial outcomes & deal value",
    blurb:
      "Cares about timeline, dollars, leverage and getting the deal done this quarter.",
    emoji: "E",
  },
  {
    id: "sophie",
    name: "Sophie",
    role: "Counterparty",
    speciality: "opposing-side simulation",
    blurb:
      "Argues from the counterparty's chair so you don't get blindsided.",
    emoji: "S",
  },
  {
    id: "antoine",
    name: "Antoine",
    role: "Crown",
    speciality: "final arbiter",
    blurb:
      "Synthesises the room into a single recommendation tied to your goal.",
    emoji: "A",
  },
];

export function getAgent(id: string): AgentDef | undefined {
  return AGENTS.find((a) => a.id === id);
}
