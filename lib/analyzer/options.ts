/**
 * Answer options for the Business Analyser. Shared by the form, the server
 * validation, the AI prompt and the admin views, so labels stay consistent.
 */

type Option = { value: string; label: string };

export const industryOptions = [
  { value: "retail", label: "Retail / shop" },
  { value: "food", label: "Restaurant, café or food" },
  { value: "health", label: "Clinic, pharmacy or health" },
  { value: "beauty", label: "Salon, spa or beauty" },
  { value: "education", label: "School or training" },
  { value: "hospitality", label: "Hotel, events or travel" },
  { value: "real-estate", label: "Real estate or property" },
  { value: "logistics", label: "Logistics, transport or delivery" },
  { value: "professional", label: "Professional services (legal, finance, consulting)" },
  { value: "manufacturing", label: "Manufacturing or agriculture" },
  { value: "ngo", label: "NGO, church or community" },
  { value: "tech", label: "Tech or startup" },
  { value: "other", label: "Something else" },
] as const satisfies readonly Option[];

export const yearsOptions = [
  { value: "idea", label: "Not launched yet" },
  { value: "under-1", label: "Less than 1 year" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-10", label: "3–10 years" },
  { value: "10-plus", label: "10+ years" },
] as const satisfies readonly Option[];

export const teamOptions = [
  { value: "solo", label: "Just me" },
  { value: "2-5", label: "2–5 people" },
  { value: "6-20", label: "6–20 people" },
  { value: "21-100", label: "21–100 people" },
  { value: "100-plus", label: "100+ people" },
] as const satisfies readonly Option[];

export const customerOptions = [
  { value: "under-50", label: "Fewer than 50" },
  { value: "50-200", label: "50–200" },
  { value: "200-1000", label: "200–1,000" },
  { value: "1000-5000", label: "1,000–5,000" },
  { value: "5000-plus", label: "5,000+" },
] as const satisfies readonly Option[];

export const channelOptions = [
  { value: "website", label: "Website" },
  { value: "online-store", label: "Online store / e-commerce" },
  { value: "whatsapp", label: "WhatsApp Business" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "google-business", label: "Google Business Profile" },
  { value: "marketplace", label: "Jumia, Tonaton or other marketplace" },
  { value: "none", label: "None yet" },
] as const satisfies readonly Option[];

export const toolOptions = [
  { value: "paper", label: "Pen and paper / notebook" },
  { value: "excel", label: "Excel or Google Sheets" },
  { value: "pos", label: "POS / till system" },
  { value: "accounting", label: "Accounting software" },
  { value: "momo", label: "Mobile money / Paystack" },
  { value: "booking", label: "Booking or appointment app" },
  { value: "crm", label: "CRM" },
  { value: "custom", label: "A custom app or system" },
] as const satisfies readonly Option[];

export const challengeOptions = [
  { value: "new-customers", label: "Getting new customers" },
  { value: "visibility", label: "Not visible online / on Google" },
  { value: "slow-replies", label: "Slow replies to calls and messages" },
  { value: "manual-records", label: "Manual record keeping" },
  { value: "inventory", label: "Managing stock or inventory" },
  { value: "sales-tracking", label: "Tracking sales and profit" },
  { value: "bookings", label: "Bookings, scheduling or no-shows" },
  { value: "payments", label: "Collecting payments" },
  { value: "retention", label: "Customers not coming back" },
  { value: "staff", label: "Coordinating staff or branches" },
] as const satisfies readonly Option[];

export const goalOptions = [
  { value: "more-sales", label: "Increase sales" },
  { value: "sell-online", label: "Start selling online" },
  { value: "save-time", label: "Save time with automation" },
  { value: "customer-service", label: "Better customer service" },
  { value: "brand", label: "Build a stronger brand" },
  { value: "expand", label: "Open new branches or markets" },
  { value: "data", label: "Make decisions with data" },
] as const satisfies readonly Option[];

export const budgetOptions = [
  { value: "under-5k", label: "Under GH₵ 5,000" },
  { value: "5k-15k", label: "GH₵ 5,000 – 15,000" },
  { value: "15k-50k", label: "GH₵ 15,000 – 50,000" },
  { value: "50k-plus", label: "GH₵ 50,000+" },
  { value: "not-sure", label: "Not sure yet" },
] as const satisfies readonly Option[];

export const timelineOptions = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-3-months", label: "In 1–3 months" },
  { value: "3-6-months", label: "In 3–6 months" },
  { value: "exploring", label: "Just exploring" },
] as const satisfies readonly Option[];

export type OptionValue<T extends readonly Option[]> = T[number]["value"];

export function values<T extends readonly Option[]>(opts: T) {
  return opts.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];
}

/** Value → label for a single option list. Falls back to the raw value. */
export function labelOf(opts: readonly Option[], value: string): string {
  return opts.find((o) => o.value === value)?.label ?? value;
}

export function labelsOf(opts: readonly Option[], vals: readonly string[]): string[] {
  return vals.map((v) => labelOf(opts, v));
}
