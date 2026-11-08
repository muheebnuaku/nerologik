import { z } from "zod";

import type { Currency, PackageId } from "./catalog";
import { packageIds } from "./catalog";

/**
 * What the model must return. All money is in GH₵; the server converts and
 * clamps to the catalogue afterwards. Kept free of numeric/length constraints
 * so it maps cleanly onto structured outputs; limits are enforced in code.
 */
export const aiReportSchema = z.object({
  headline: z.string().describe("One punchy sentence summarising the biggest opportunity, under 20 words."),
  summary: z.string().describe("3-4 sentence executive summary of the business and what it should do next."),
  digitalMaturity: z.object({
    score: z.number().int().describe("1 (fully offline) to 10 (fully digital and data-driven)."),
    label: z.string().describe("2-3 words, e.g. 'Early digital', 'Growing online'."),
    explanation: z.string().describe("1-2 sentences explaining the score."),
  }),
  customerInsight: z
    .string()
    .describe("2-3 sentences on the walk-in vs online mix, customer volume and what it means for this business in its location."),
  locationInsight: z
    .string()
    .describe("1-2 sentences on how the city/country shapes the approach (payments, channels, competition, connectivity)."),
  keyFindings: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .describe("3-5 specific findings drawn from the answers."),
  opportunities: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
        impact: z.enum(["high", "medium", "low"]),
      }),
    )
    .describe("3-4 opportunities ranked by impact."),
  recommendation: z.object({
    packageId: z.enum(packageIds).describe("The single best-fit package from the catalogue."),
    title: z.string().describe("A tailored name for the solution, e.g. 'WhatsApp ordering assistant for Mama's Kitchen'."),
    why: z.string().describe("2-3 sentences on why this is the best fit for THIS business."),
    features: z.array(z.string()).describe("4-7 concrete features tailored to the business."),
  }),
  estimate: z.object({
    oneTimeMinGhs: z.number().int(),
    oneTimeMaxGhs: z.number().int(),
    monthlyMinGhs: z.number().int(),
    monthlyMaxGhs: z.number().int(),
    lineItems: z
      .array(z.object({ item: z.string(), amountGhs: z.number().int() }))
      .describe("3-6 one-time cost components whose amounts sum to roughly the midpoint of the one-time range."),
    assumptions: z.array(z.string()).describe("2-4 short assumptions the estimate depends on."),
  }),
  addOns: z
    .array(z.object({ packageId: z.enum(packageIds), why: z.string() }))
    .describe("0-2 optional complementary packages (different from the recommendation)."),
  roadmap: z
    .array(z.object({ phase: z.string(), timeframe: z.string(), actions: z.array(z.string()) }))
    .describe("Exactly 3 phases from launch to growth."),
  expectedImpact: z.string().describe("1-2 sentences of realistic, non-guaranteed expected impact."),
});

export type AiReport = z.infer<typeof aiReportSchema>;

/** The report as stored, shown on screen, and emailed. */
export type AnalysisReport = Omit<AiReport, "estimate" | "addOns" | "recommendation"> & {
  recommendation: AiReport["recommendation"] & {
    packageName: string;
    service: string;
    timeline: string;
    includes: string[];
  };
  estimate: {
    currency: Currency;
    oneTimeMin: number;
    oneTimeMax: number;
    monthlyMin: number;
    monthlyMax: number;
    lineItems: { item: string; amount: number }[];
    assumptions: string[];
  };
  addOns: { packageId: PackageId; name: string; why: string; priceFrom: number }[];
  generatedAt: string;
};
