/**
 * One-click redaction: strip personal info, dollar amounts, dates, emails,
 * phone numbers, and a small list of "names" the caller flags as sensitive.
 *
 * Pure function. No external calls. Used for both chat export and Slack memo.
 */

const PATTERNS: { name: string; re: RegExp; replace: string }[] = [
  { name: "email", re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, replace: "[redacted email]" },
  { name: "phone", re: /(\+?\d[\d\s\-().]{7,}\d)/g, replace: "[redacted phone]" },
  { name: "money", re: /(?:CA?\$|US?\$|\$)\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:k|m|million|thousand|MM|K))?/gi, replace: "[redacted amount]" },
  {
    name: "date",
    re: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?)\b/g,
    replace: "[redacted date]",
  },
  { name: "ssn", re: /\b\d{3}-\d{2}-\d{4}\b/g, replace: "[redacted id]" },
];

export interface RedactResult {
  text: string;
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
      return p.replace;
    });
    if (n > 0) countByKind[p.name] = n;
  }

  const trimmed = extraNames.map((s) => s.trim()).filter(Boolean);
  for (const raw of trimmed) {
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

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
