/**
 * One-click redaction. Two outputs:
 *   redact()        -> plain text with `[redacted X]` markers (for downloads).
 *   redactToHtml()  -> escaped HTML with `<span class="redact-bar">…</span>` so
 *                       sensitive substrings render as opaque black boxes
 *                       in the UI (true blackout, not a blur).
 *
 * Pure function. No external calls.
 */

const PATTERNS: { name: string; re: RegExp; placeholder: string }[] = [
  { name: "email", re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, placeholder: "[redacted email]" },
  { name: "phone", re: /(\+?\d[\d\s\-().]{7,}\d)/g, placeholder: "[redacted phone]" },
  {
    name: "money",
    re: /(?:CA?\$|US?\$|\$)\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:k|m|million|thousand|MM|K))?/gi,
    placeholder: "[redacted amount]",
  },
  {
    name: "date",
    re: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?)\b/g,
    placeholder: "[redacted date]",
  },
  { name: "ssn", re: /\b\d{3}-\d{2}-\d{4}\b/g, placeholder: "[redacted id]" },
];

export interface RedactResult {
  text: string;
  countByKind: Record<string, number>;
  total: number;
}

export interface RedactHtmlResult {
  html: string;
  countByKind: Record<string, number>;
  total: number;
}

export function redact(input: string, extraNames: string[] = []): RedactResult {
  let out = input;
  const countByKind: Record<string, number> = {};
  for (const p of PATTERNS) {
    let n = 0;
    out = out.replace(p.re, () => {
      n += 1;
      return p.placeholder;
    });
    if (n > 0) countByKind[p.name] = n;
  }
  for (const raw of extraNames.map((s) => s.trim()).filter(Boolean)) {
    const re = new RegExp(`\\b${escapeRegExp(raw)}\\b`, "gi");
    let n = 0;
    out = out.replace(re, () => {
      n += 1;
      return "[redacted name]";
    });
    if (n > 0) countByKind.name = (countByKind.name ?? 0) + n;
  }
  const total = Object.values(countByKind).reduce((a, b) => a + b, 0);
  return { text: out, countByKind, total };
}

/**
 * Same patterns as `redact`, but each match is wrapped in a styled span the
 * caller injects via `dangerouslySetInnerHTML`. The visible text is the
 * original (so widths line up) but is invisibly black-on-black; the span
 * itself is an opaque black box you cannot read through.
 */
export function redactToHtml(input: string, extraNames: string[] = []): RedactHtmlResult {
  let html = escapeHtml(input);
  const countByKind: Record<string, number> = {};

  for (const p of PATTERNS) {
    let n = 0;
    html = html.replace(p.re, (match) => {
      n += 1;
      return wrap(match, p.name);
    });
    if (n > 0) countByKind[p.name] = n;
  }

  for (const raw of extraNames.map((s) => s.trim()).filter(Boolean)) {
    const re = new RegExp(`\\b${escapeRegExp(raw)}\\b`, "gi");
    let n = 0;
    html = html.replace(re, (match) => {
      n += 1;
      return wrap(match, "name");
    });
    if (n > 0) countByKind.name = (countByKind.name ?? 0) + n;
  }

  const total = Object.values(countByKind).reduce((a, b) => a + b, 0);
  return { html, countByKind, total };
}

function wrap(match: string, kind: string): string {
  // Already-escaped match comes in (we escaped the whole input first).
  return `<span class="redact-bar" data-kind="${kind}" title="redacted ${kind}">${match}</span>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
