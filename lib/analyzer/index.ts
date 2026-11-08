import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import type { AnalysisInput } from "@/lib/validations/analysis";

import { aiConfigured, aiReport, ANALYZER_MODEL } from "./ai";
import { finalizeReport, rulesReport } from "./engine";
import type { AnalysisReport } from "./report";

export type AnalysisOutcome = {
  report: AnalysisReport;
  engine: "ai" | "rules";
  model: string | null;
};

/**
 * AI analysis when ANTHROPIC_API_KEY is set, otherwise (or if the AI call
 * fails) the rule-based engine, so the client always gets an estimate.
 */
export async function runAnalysis(input: AnalysisInput): Promise<AnalysisOutcome> {
  if (aiConfigured()) {
    try {
      const raw = await aiReport(input);
      return { report: finalizeReport(raw, input), engine: "ai", model: ANALYZER_MODEL };
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        console.error("[analyzer] ANTHROPIC_API_KEY is invalid; using rules engine.");
      } else if (error instanceof Anthropic.RateLimitError) {
        console.error("[analyzer] Rate limited by the Claude API; using rules engine.");
      } else if (error instanceof Anthropic.APIError) {
        console.error(`[analyzer] Claude API error ${error.status}: ${error.message}; using rules engine.`);
      } else {
        console.error("[analyzer] AI analysis failed; using rules engine:", error instanceof Error ? error.message : error);
      }
    }
  }
  return { report: finalizeReport(rulesReport(input), input), engine: "rules", model: null };
}
