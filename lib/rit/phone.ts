/**
 * Normalises a phone number to international digits.
 * Ghana local formats (024 123 4567, 24 123 4567) become 233241234567.
 */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (/^0\d{9}$/.test(d)) d = `233${d.slice(1)}`;
  else if (/^[2-5]\d{8}$/.test(d)) d = `233${d}`;
  d = d.replace(/\D/g, "");
  return /^\d{9,15}$/.test(d) ? d : null;
}

/** Internal sign-in address for a phone account. Never emailed. */
export const phoneLoginEmail = (digits: string) => `${digits}@rit.nerologik.com`;

export function formatPhone(digits: string): string {
  if (digits.startsWith("233") && digits.length === 12) return `+233 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  return `+${digits}`;
}
