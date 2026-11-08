import type { ServiceSlug } from "@/lib/content/services";

/**
 * The packages the analyser may recommend, with price bands in GH₵.
 * The AI is only allowed to pick from these and quote inside these bands, so
 * every estimate a client receives is one the team can honour.
 *
 * PLACEHOLDER pricing aligned with lib/content/services.ts — confirm with the team.
 */
export type Package = {
  id: PackageId;
  service: ServiceSlug;
  name: string;
  /** What it is, for the AI and for the email. */
  description: string;
  /** One-time build cost band (GH₵). */
  min: number;
  max: number;
  /** Monthly running cost band (GH₵): hosting, AI usage, retainers. 0 if none. */
  monthlyMin: number;
  monthlyMax: number;
  timeline: string;
  includes: string[];
};

export const packageIds = [
  "business-website",
  "online-store",
  "web-app",
  "mobile-app",
  "ai-assistant",
  "ai-automation-suite",
  "growth-marketing",
  "business-system",
  "multi-branch-platform",
] as const;

export type PackageId = (typeof packageIds)[number];

export const packages: Record<PackageId, Package> = {
  "business-website": {
    id: "business-website",
    service: "web-mobile-apps",
    name: "Business website",
    description: "Fast, mobile-first website with WhatsApp, booking/enquiry forms, Google Maps and SEO setup.",
    min: 3480,
    max: 6980,
    monthlyMin: 0,
    monthlyMax: 180,
    timeline: "2–3 weeks",
    includes: ["Mobile-first design", "SEO & Google Analytics", "WhatsApp & enquiry forms", "Content management", "1 month of free changes"],
  },
  "online-store": {
    id: "online-store",
    service: "web-mobile-apps",
    name: "Online store with MoMo & card payments",
    description: "E-commerce site with product catalogue, MoMo/card checkout (Paystack), delivery options and order management.",
    min: 7980,
    max: 16980,
    monthlyMin: 180,
    monthlyMax: 480,
    timeline: "3–6 weeks",
    includes: ["Product catalogue & search", "MoMo, card & Paystack checkout", "Order & delivery management", "WhatsApp order alerts", "Sales dashboard"],
  },
  "web-app": {
    id: "web-app",
    service: "web-mobile-apps",
    name: "Web app / customer portal",
    description: "Logged-in web app: customer accounts, bookings, memberships, portals or dashboards.",
    min: 12980,
    max: 29980,
    monthlyMin: 280,
    monthlyMax: 880,
    timeline: "6–10 weeks",
    includes: ["User accounts & roles", "Bookings or memberships", "Payments", "Admin dashboard", "3 months of support"],
  },
  "mobile-app": {
    id: "mobile-app",
    service: "web-mobile-apps",
    name: "iOS & Android app",
    description: "Cross-platform mobile app (React Native) with loyalty, ordering, bookings or customer accounts.",
    min: 19800,
    max: 48980,
    monthlyMin: 380,
    monthlyMax: 1280,
    timeline: "8–12 weeks",
    includes: ["One app for iPhone & Android", "Push notifications", "Payments & accounts", "App Store & Play Store launch", "3 months of support"],
  },
  "ai-assistant": {
    id: "ai-assistant",
    service: "ai-automation",
    name: "AI WhatsApp & website assistant",
    description: "24/7 AI assistant on WhatsApp and/or the website that answers questions, takes orders/bookings and captures leads, with human hand-off.",
    min: 3880,
    max: 8980,
    monthlyMin: 380,
    monthlyMax: 1480,
    timeline: "1–3 weeks",
    includes: ["Trained on your products & FAQs", "Orders, bookings or lead capture", "Hand-off to a human", "WhatsApp Business API setup", "Monthly usage report"],
  },
  "ai-automation-suite": {
    id: "ai-automation-suite",
    service: "ai-automation",
    name: "AI assistant + workflow automation",
    description: "AI assistant plus automated workflows: follow-ups, reminders, invoices, reports, data entry and integrations with existing tools.",
    min: 8980,
    max: 19800,
    monthlyMin: 680,
    monthlyMax: 2480,
    timeline: "3–6 weeks",
    includes: ["AI assistant on WhatsApp/web", "Automated reminders & follow-ups", "Sheets/accounting integrations", "Automatic reports", "Monthly optimisation"],
  },
  "growth-marketing": {
    id: "growth-marketing",
    service: "digital-marketing",
    name: "Growth marketing retainer",
    description: "Social content, Meta & Google ads management, SEO and Google Business Profile, with monthly reporting. Ad spend billed separately.",
    min: 980,
    max: 1980,
    monthlyMin: 2480,
    monthlyMax: 5980,
    timeline: "Ongoing, 3-month minimum",
    includes: ["Social content & posting", "Meta & Google ads management", "SEO & Google Business Profile", "Monthly report & strategy call"],
  },
  "business-system": {
    id: "business-system",
    service: "custom-software",
    name: "Custom business system",
    description: "Custom POS, inventory, sales, CRM or operations system shaped around how the business runs, with dashboards and roles.",
    min: 14800,
    max: 34980,
    monthlyMin: 380,
    monthlyMax: 1280,
    timeline: "6–10 weeks",
    includes: ["Discovery workshop & fixed scope", "Inventory, sales & customer records", "Admin dashboard & staff roles", "MoMo/card payments", "3 months of support"],
  },
  "multi-branch-platform": {
    id: "multi-branch-platform",
    service: "custom-software",
    name: "Multi-branch platform",
    description: "Central platform across branches or regions: consolidated reporting, stock transfers, staff management, customer app/portal and integrations.",
    min: 34980,
    max: 89800,
    monthlyMin: 880,
    monthlyMax: 2980,
    timeline: "10–16 weeks",
    includes: ["Multi-branch dashboards", "Central stock & sales", "Staff roles & permissions", "Integrations & APIs", "Hosting, handover & support"],
  },
};

/**
 * Rough GH₵ per US$ used for international quotes (projects outside Ghana are
 * quoted in USD). TODO(owner): update when the cedi moves meaningfully.
 */
export const GHS_PER_USD = 15;

export type Currency = "GHS" | "USD";

export function currencyFor(country: string): Currency {
  return /^\s*(gh|ghana)\b/i.test(country) ? "GHS" : "USD";
}

/** Converts a GH₵ amount into the quote currency, rounded to the nearest 10. */
export function convertFromGhs(amountGhs: number, currency: Currency): number {
  if (amountGhs <= 0) return 0;
  const raw = currency === "GHS" ? amountGhs : amountGhs / GHS_PER_USD;
  return Math.max(10, Math.round(raw / 10) * 10);
}

export function formatMoney(amount: number, currency: Currency): string {
  const symbol = currency === "GHS" ? "GH₵" : "US$";
  return `${symbol} ${amount.toLocaleString("en-US")}`;
}

export function formatRange(min: number, max: number, currency: Currency): string {
  if (min === max) return formatMoney(min, currency);
  return `${formatMoney(min, currency)} – ${formatMoney(max, currency).replace(/^\S+\s/, "")}`;
}
