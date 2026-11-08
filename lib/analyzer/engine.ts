import type { AnalysisInput } from "@/lib/validations/analysis";

import { convertFromGhs, currencyFor, packages, type PackageId } from "./catalog";
import {
  budgetOptions,
  challengeOptions,
  channelOptions,
  customerOptions,
  goalOptions,
  industryOptions,
  labelOf,
  labelsOf,
  teamOptions,
  timelineOptions,
  toolOptions,
  yearsOptions,
} from "./options";
import type { AiReport, AnalysisReport } from "./report";

/** Human-readable profile of the answers. Used in the AI prompt and the admin. */
export function describeAnswers(a: AnalysisInput): string {
  const lines = [
    `Business name: ${a.businessName}`,
    `Industry: ${labelOf(industryOptions, a.industry)}`,
    `What they do: ${a.description}`,
    `Location: ${a.city}, ${a.country} (${a.branches} ${a.branches === 1 ? "location" : "locations/branches"})`,
    `Time in business: ${labelOf(yearsOptions, a.yearsInBusiness)}`,
    `Team size: ${labelOf(teamOptions, a.teamSize)}`,
    `Customers per month: ${labelOf(customerOptions, a.monthlyCustomers)}`,
    `Customer mix: ${a.walkInPct}% walk-in / in person, ${100 - a.walkInPct}% online (calls, WhatsApp, social, web)`,
    `Online channels today: ${labelsOf(channelOptions, a.channels).join(", ")}`,
    `Tools used today: ${a.tools.length ? labelsOf(toolOptions, a.tools).join(", ") : "None mentioned"}`,
    `Biggest challenges: ${labelsOf(challengeOptions, a.challenges).join(", ")}`,
    `Goals for the next 12 months: ${labelsOf(goalOptions, a.goals).join(", ")}`,
    `Budget: ${labelOf(budgetOptions, a.budget)}`,
    `Timeline: ${labelOf(timelineOptions, a.timeline)}`,
  ];
  if (a.extraContext) lines.push(`Anything else: ${a.extraContext}`);
  return lines.join("\n");
}

const volumeRank: Record<AnalysisInput["monthlyCustomers"], number> = {
  "under-50": 0,
  "50-200": 1,
  "200-1000": 2,
  "1000-5000": 3,
  "5000-plus": 4,
};

const budgetCeilingGhs: Record<AnalysisInput["budget"], number> = {
  "under-5k": 5000,
  "5k-15k": 15000,
  "15k-50k": 50000,
  "50k-plus": Infinity,
  "not-sure": Infinity,
};

/** 1–10 digital maturity from channels and tools. */
export function maturityScore(a: AnalysisInput): number {
  const channels = a.channels.filter((c) => c !== "none");
  let score = 1 + Math.min(channels.length, 4);
  if (a.channels.includes("website") || a.channels.includes("online-store")) score += 1;
  const digitalTools = a.tools.filter((t) => t !== "paper");
  score += Math.min(digitalTools.length, 3);
  if (a.tools.includes("paper") && digitalTools.length === 0) score -= 1;
  if (a.tools.includes("custom") || a.tools.includes("crm")) score += 1;
  return Math.max(1, Math.min(10, score));
}

/** Rule-based package choice: scores every package against the answers. */
export function pickPackages(a: AnalysisInput): PackageId[] {
  const has = (list: readonly string[], ...vals: string[]) => vals.some((v) => list.includes(v));
  const vol = volumeRank[a.monthlyCustomers];
  const online = 100 - a.walkInPct;
  const noWebsite = !has(a.channels, "website", "online-store");
  const big = has([a.teamSize], "21-100", "100-plus") || a.branches > 1;

  const score: Record<PackageId, number> = {
    "business-website": 0,
    "online-store": 0,
    "web-app": 0,
    "mobile-app": 0,
    "ai-assistant": 0,
    "ai-automation-suite": 0,
    "growth-marketing": 0,
    "business-system": 0,
    "multi-branch-platform": 0,
  };

  if (noWebsite) score["business-website"] += 3;
  if (has(a.challenges, "visibility")) score["business-website"] += 2;
  if (has(a.challenges, "visibility", "new-customers")) score["growth-marketing"] += 3;
  if (has(a.goals, "brand", "more-sales")) score["growth-marketing"] += 1;

  if (has(a.goals, "sell-online")) score["online-store"] += 4;
  if (has(a.challenges, "payments")) score["online-store"] += 1;
  if (a.industry === "retail" || a.industry === "food") score["online-store"] += 1;

  if (has(a.challenges, "slow-replies")) score["ai-assistant"] += 4;
  if (has(a.goals, "customer-service")) score["ai-assistant"] += 2;
  if (a.channels.includes("whatsapp") && online >= 30) score["ai-assistant"] += 2;
  if (has(a.challenges, "bookings")) score["ai-assistant"] += 1;

  if (has(a.goals, "save-time")) score["ai-automation-suite"] += 3;
  if (has(a.challenges, "manual-records", "retention")) score["ai-automation-suite"] += 1;
  if (vol >= 2) score["ai-automation-suite"] += 1;

  if (has(a.challenges, "bookings")) score["web-app"] += 2;
  if (a.industry === "education" || a.industry === "health") score["web-app"] += 1;

  if (has(a.challenges, "retention") && vol >= 3) score["mobile-app"] += 2;
  if (vol >= 3 && online >= 50) score["mobile-app"] += 1;

  if (has(a.challenges, "inventory", "sales-tracking", "manual-records")) score["business-system"] += 3;
  if (has(a.goals, "data")) score["business-system"] += 2;
  if (has(a.challenges, "staff")) score["business-system"] += 1;

  if (big && has(a.challenges, "staff", "inventory", "sales-tracking")) score["multi-branch-platform"] += 3;
  if (has(a.goals, "expand")) score["multi-branch-platform"] += 2;
  if (a.branches >= 3) score["multi-branch-platform"] += 2;

  // Respect the budget: heavily penalise packages whose floor is far above it.
  const ceiling = budgetCeilingGhs[a.budget];
  for (const id of Object.keys(score) as PackageId[]) {
    if (packages[id].min > ceiling * 1.2) score[id] -= 5;
  }

  return (Object.keys(score) as PackageId[]).sort((x, y) => score[y] - score[x]);
}

/** Full report without AI. Deterministic and always available. */
export function rulesReport(a: AnalysisInput): AiReport {
  const [main, ...rest] = pickPackages(a);
  const pkg = packages[main];
  const addOnIds = rest.filter((id) => packages[id].service !== pkg.service).slice(0, 2);
  const score = maturityScore(a);
  const online = 100 - a.walkInPct;
  const mix =
    a.walkInPct >= 70
      ? "Most of your customers still come through the door"
      : online >= 70
        ? "Most of your customers already find you online"
        : "Your customers are split between walk-ins and online";

  const mid = Math.round((pkg.min + pkg.max) / 2);
  const challenges = labelsOf(challengeOptions, a.challenges);

  return {
    headline: `${a.businessName} is ready for a ${pkg.name.toLowerCase()} to ${labelOf(goalOptions, a.goals[0]).toLowerCase()}.`,
    summary: `${a.businessName} is a ${labelOf(industryOptions, a.industry).toLowerCase()} business in ${a.city} serving ${labelOf(customerOptions, a.monthlyCustomers).toLowerCase()} customers a month. Your biggest blockers are ${challenges.slice(0, 2).join(" and ").toLowerCase()}. A ${pkg.name.toLowerCase()} addresses these directly and fits your budget and timeline.`,
    digitalMaturity: {
      score,
      label: score <= 3 ? "Early digital" : score <= 6 ? "Growing online" : "Digitally established",
      explanation: `Based on ${a.channels.filter((c) => c !== "none").length} online channels and ${a.tools.length} business tools in use today.`,
    },
    customerInsight: `${mix} (${a.walkInPct}% walk-in, ${online}% online). ${online < 40 ? "There is room to capture customers who search and message before they visit." : "Fast, reliable online responses will directly affect how many enquiries turn into sales."}`,
    locationInsight: `Customers in ${a.country} expect ${currencyFor(a.country) === "GHS" ? "mobile money payments and quick WhatsApp replies" : "smooth card payments and instant online responses"}, so both are built in.`,
    keyFindings: challenges.slice(0, 4).map((c) => ({
      title: c,
      detail: "You flagged this as a top challenge; the recommended solution tackles it directly.",
    })),
    opportunities: [pkg, ...addOnIds.map((id) => packages[id])].map((p, i) => ({
      title: p.name,
      detail: p.description,
      impact: i === 0 ? "high" : "medium",
    })),
    recommendation: {
      packageId: main,
      title: `${pkg.name} for ${a.businessName}`,
      why: `It targets your top challenges (${challenges.slice(0, 2).join(", ").toLowerCase()}) and supports your goal to ${labelOf(goalOptions, a.goals[0]).toLowerCase()}.`,
      features: pkg.includes,
    },
    estimate: {
      oneTimeMinGhs: pkg.min,
      oneTimeMaxGhs: pkg.max,
      monthlyMinGhs: pkg.monthlyMin,
      monthlyMaxGhs: pkg.monthlyMax,
      lineItems: [
        { item: "Discovery, design & planning", amountGhs: Math.round(mid * 0.2) },
        { item: "Build & integrations", amountGhs: Math.round(mid * 0.6) },
        { item: "Testing, launch & training", amountGhs: Math.round(mid * 0.2) },
      ],
      assumptions: [
        "Scope confirmed on a free discovery call",
        "Content (logos, photos, product details) provided by you",
      ],
    },
    addOns: addOnIds.map((id) => ({ packageId: id, why: packages[id].description })),
    roadmap: [
      { phase: "Set up", timeframe: "Weeks 1–2", actions: ["Discovery call and fixed scope", "Design and content gathering"] },
      { phase: "Build & launch", timeframe: pkg.timeline, actions: ["Build, test and launch", "Train your team"] },
      { phase: "Grow", timeframe: "Months 2–6", actions: ["Track results monthly", "Add the next improvement"] },
    ],
    expectedImpact: "Faster responses and better visibility typically lift enquiries and repeat customers within the first few months.",
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));

/**
 * Turns a raw report (AI or rules) into the stored report: clamps every amount
 * to the package's band, converts currency, and fills catalogue details.
 */
export function finalizeReport(raw: AiReport, a: AnalysisInput): AnalysisReport {
  const pkg = packages[raw.recommendation.packageId];
  const currency = currencyFor(a.country);
  const e = raw.estimate;

  // One-time may stretch up to 1.5x the band for larger scopes, never below the floor.
  const oneMin = clamp(e.oneTimeMinGhs, pkg.min, pkg.max * 1.5);
  const oneMax = clamp(e.oneTimeMaxGhs, oneMin, pkg.max * 1.5);
  const monMin = pkg.monthlyMax === 0 ? 0 : clamp(e.monthlyMinGhs, pkg.monthlyMin, pkg.monthlyMax * 1.5);
  const monMax = pkg.monthlyMax === 0 ? 0 : clamp(e.monthlyMaxGhs, monMin, pkg.monthlyMax * 1.5);

  const addOns = raw.addOns
    .filter((x, i, arr) => x.packageId !== pkg.id && arr.findIndex((y) => y.packageId === x.packageId) === i)
    .slice(0, 2)
    .map((x) => ({
      packageId: x.packageId,
      name: packages[x.packageId].name,
      why: x.why,
      priceFrom: convertFromGhs(packages[x.packageId].min, currency),
    }));

  return {
    headline: raw.headline,
    summary: raw.summary,
    digitalMaturity: { ...raw.digitalMaturity, score: clamp(raw.digitalMaturity.score, 1, 10) },
    customerInsight: raw.customerInsight,
    locationInsight: raw.locationInsight,
    keyFindings: raw.keyFindings.slice(0, 5),
    opportunities: raw.opportunities.slice(0, 4),
    recommendation: {
      ...raw.recommendation,
      features: raw.recommendation.features.slice(0, 8),
      packageName: pkg.name,
      service: pkg.service,
      timeline: pkg.timeline,
      includes: pkg.includes,
    },
    estimate: {
      currency,
      oneTimeMin: convertFromGhs(oneMin, currency),
      oneTimeMax: convertFromGhs(oneMax, currency),
      monthlyMin: convertFromGhs(monMin, currency),
      monthlyMax: convertFromGhs(monMax, currency),
      lineItems: e.lineItems
        .slice(0, 6)
        .filter((li) => li.amountGhs > 0)
        .map((li) => ({ item: li.item, amount: convertFromGhs(li.amountGhs, currency) })),
      assumptions: e.assumptions.slice(0, 4),
    },
    addOns,
    roadmap: raw.roadmap.slice(0, 3),
    expectedImpact: raw.expectedImpact,
    generatedAt: new Date().toISOString(),
  };
}
