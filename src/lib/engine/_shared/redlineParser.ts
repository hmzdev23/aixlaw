/**
 * Parse the Spellbook redline marker convention:
 *   `~~deleted~~`
 *   `**[INITECH ADD: text]**`
 *   `*[INITECH COMMENT: note]*`
 *
 * Returns clean prose plus a structured list of changes the Ghost engine and
 * Cockpit Pile can both consume.
 */

export interface ParsedRedlineSegment {
  kind: "deletion" | "addition" | "comment";
  text: string;
  /** Character offset in the original source string, useful for UI ranges. */
  start: number;
  end: number;
}

export interface ParsedRedlinedDoc {
  segments: ParsedRedlineSegment[];
  /** Plain text with all redline markers removed (deletions dropped, additions kept). */
  cleanedText: string;
}

const DELETE_RE = /~~([\s\S]+?)~~/g;
const ADD_RE = /\*\*\[INITECH ADD: ([\s\S]+?)\]\*\*/g;
const COMMENT_RE = /\*\[INITECH COMMENT: ([\s\S]+?)\]\*/g;

function collect(
  src: string,
  re: RegExp,
  kind: ParsedRedlineSegment["kind"]
): ParsedRedlineSegment[] {
  const out: ParsedRedlineSegment[] = [];
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(src)) !== null) {
    out.push({
      kind,
      text: m[1].trim(),
      start: m.index,
      end: m.index + m[0].length,
    });
  }
  return out;
}

export function parseRedlinedDoc(src: string): ParsedRedlinedDoc {
  if (typeof src !== "string") {
    return { segments: [], cleanedText: "" };
  }
  const deletions = collect(src, DELETE_RE, "deletion");
  const additions = collect(src, ADD_RE, "addition");
  const comments = collect(src, COMMENT_RE, "comment");

  const segments = [...deletions, ...additions, ...comments].sort(
    (a, b) => a.start - b.start
  );

  // Cleaned text: drop deletions, keep addition payloads inline, drop comments.
  // Order of replacements matters — comments first (they may sit inside additions),
  // then additions, then deletions.
  const cleaned = src
    .replace(COMMENT_RE, "")
    .replace(ADD_RE, "$1")
    .replace(DELETE_RE, "");

  return { segments, cleanedText: cleaned };
}

/** Convenience: how many distinct change segments are present. */
export function countChanges(src: string): {
  additions: number;
  deletions: number;
  comments: number;
} {
  const parsed = parseRedlinedDoc(src);
  let a = 0,
    d = 0,
    c = 0;
  for (const s of parsed.segments) {
    if (s.kind === "addition") a += 1;
    else if (s.kind === "deletion") d += 1;
    else c += 1;
  }
  return { additions: a, deletions: d, comments: c };
}
