/**
 * Parser for the Initech redline marker format used in
 * `Example Scenario (Optional)/msa_initech_redlines.md` and
 * `nda_initech_redlines.md`. Server-only.
 *
 * Marker format (DEMO_FIXTURES.md §1):
 *   ~~strike~~                      -> Initech deleted this run of text
 *   **[INITECH ADD: text]**         -> Initech added this run of text
 *   *[INITECH COMMENT: text]*       -> Initech's internal comment
 *
 * The parser walks the file by `### N.M` clause headings and emits a structured
 * `RedlineClause` per clause. We stay deliberately conservative: nothing here
 * mutates the source files (they are read-only fixtures per BRANCHING_AND_GIT.md).
 */

export interface RedlineRun {
  kind: "delete" | "insert" | "comment";
  text: string;
}

export interface RedlineClause {
  /** Clause heading like "2.1" — extracted from `### 2.1 ...` lines. */
  ref: string | null;
  /** Heading title without the leading number. */
  title: string;
  /** Full body text of the clause (markers preserved). */
  body: string;
  /** Extracted runs in order of appearance. */
  runs: RedlineRun[];
}

const CLAUSE_HEADING = /^###\s+(?:\*\*)?(\d+(?:\.\d+)?)\s+([^*\n]+?)(?:\*\*)?$/;
const SECTION_HEADING = /^##\s+(?:\*\*)?(\d+\.)?\s*(.+?)(?:\*\*)?$/;

const STRIKE_RE = /~~([\s\S]*?)~~/g;
const INSERT_RE = /\*\*\[INITECH ADD:\s*([\s\S]*?)\]\*\*/g;
const COMMENT_RE = /\*\[INITECH COMMENT:\s*([\s\S]*?)\]\*/g;

export function parseRedlineMarkdown(md: string): RedlineClause[] {
  const lines = md.split(/\r?\n/);
  const clauses: RedlineClause[] = [];

  let current: RedlineClause | null = null;

  function flush(): void {
    if (!current) return;
    current.body = current.body.trimEnd();
    current.runs = extractRuns(current.body);
    if (current.runs.length > 0 || /[A-Za-z]/.test(current.body)) {
      clauses.push(current);
    }
    current = null;
  }

  for (const line of lines) {
    const clauseMatch = CLAUSE_HEADING.exec(line);
    if (clauseMatch) {
      flush();
      current = {
        ref: clauseMatch[1] ?? null,
        title: clauseMatch[2]?.trim() ?? "",
        body: "",
        runs: [],
      };
      continue;
    }
    const sectionMatch = SECTION_HEADING.exec(line);
    if (sectionMatch) {
      flush();
      current = {
        ref: null,
        title: sectionMatch[2]?.trim() ?? "",
        body: "",
        runs: [],
      };
      continue;
    }
    if (current) {
      current.body += `${line}\n`;
    }
  }
  flush();
  return clauses;
}

function extractRuns(body: string): RedlineRun[] {
  const runs: RedlineRun[] = [];
  collect(body, STRIKE_RE, "delete", runs);
  collect(body, INSERT_RE, "insert", runs);
  collect(body, COMMENT_RE, "comment", runs);
  return runs;
}

function collect(
  body: string,
  re: RegExp,
  kind: RedlineRun["kind"],
  acc: RedlineRun[],
): void {
  // Reset stateful regex.
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const text = m[1];
    if (typeof text === "string" && text.trim().length > 0) {
      acc.push({ kind, text: text.trim() });
    }
  }
}

/** Plain-text view with all markers stripped — used in PDF body. */
export function stripMarkers(body: string): string {
  return body
    .replace(STRIKE_RE, "$1")
    .replace(INSERT_RE, "$1")
    .replace(COMMENT_RE, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}
