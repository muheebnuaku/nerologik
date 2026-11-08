/**
 * Blocks taxpayer identifiers from ever being saved in research notes.
 * Deliberately strict: counts like "40 notices" and "6 banks" pass;
 * anything that looks like an ID, account, contact or exact amount does not.
 */
const patterns: { label: string; re: RegExp }[] = [
  { label: "a Ghana Card number", re: /\bGHA-?\d{6,}-?\d?\b/i },
  { label: "a TIN", re: /\b[CGPQV]\d{9,11}\b/i },
  { label: "an account or ID number", re: /\d(?:[\s-]?\d){7,}/ },
  { label: "an email address", re: /[^\s@]+@[^\s@]+\.[^\s@]+/ },
  { label: "a phone number", re: /(?:\+?233|\b0)[235]\d(?:[\s-]?\d){6,7}\b/ },
  { label: "an exact cedi amount", re: /(?:GH[₵S¢C]|cedis?\b|₵)\s?\d{1,3}(?:[,\s]\d{3})+(?:\.\d+)?|\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\s?(?:GH[₵S¢C]|cedis?\b)/i },
];

export function findSensitive(text: string): { label: string; match: string }[] {
  if (!text) return [];
  const hits: { label: string; match: string }[] = [];
  for (const p of patterns) {
    const m = text.match(p.re);
    if (m && !hits.some((h) => h.label === p.label)) hits.push({ label: p.label, match: m[0] });
  }
  return hits;
}
