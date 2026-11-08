"use server";

import { z } from "zod";

import { runAnalysis } from "@/lib/analyzer";
import { deliverEstimate } from "@/lib/analyzer/deliver";
import type { AnalysisReport } from "@/lib/analyzer/report";
import { analysisNotificationEmail } from "@/lib/email/estimate-email";
import { emailConfigured, sendEmail } from "@/lib/email/send";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { analysisSchema, type AnalysisInput } from "@/lib/validations/analysis";

export type AnalysisResult =
  | { status: "success"; report: AnalysisReport; emailed: boolean }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<keyof AnalysisInput, string[]>> };

const TOO_MANY =
  "You've run several analyses in a short time. Please wait a little, or message us on WhatsApp and we'll help directly.";
const FAILURE = "Something went wrong running your analysis. Please try again, or reach us on WhatsApp.";

/** Each address may run this many analyses per day. */
const MAX_PER_EMAIL_PER_DAY = 3;

export async function submitAnalysis(input: unknown): Promise<AnalysisResult> {
  const parsed = analysisSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Some answers need another look.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { website, ...answers } = parsed.data;
  // Honeypot filled: almost certainly a bot. Don't spend an AI call on it.
  if (website) return { status: "error", message: FAILURE };

  // AI analyses cost money: stricter limits than the contact form.
  if (!rateLimit(`analysis:${await clientIp()}`, 4, 60 * 60_000)) return { status: "error", message: TOO_MANY };

  const email = answers.email.trim().toLowerCase();
  const a: AnalysisInput = { ...answers, email };

  if (await tooManyFromEmail(email)) return { status: "error", message: TOO_MANY };

  let outcome;
  try {
    outcome = await runAnalysis(a);
  } catch (error) {
    console.error("[analyzer] analysis failed:", error instanceof Error ? error.message : error);
    return { status: "error", message: FAILURE };
  }
  const { report } = outcome;

  // Store for the admin. A storage failure must not cost the client their estimate.
  let id: string | null = null;
  try {
    const { data, error } = await createAdminClient()
      .from("business_analyses")
      .insert({
        contact_name: a.contactName,
        email,
        phone: a.phone || null,
        business_name: a.businessName,
        industry: a.industry,
        city: a.city,
        country: a.country,
        monthly_customers: a.monthlyCustomers,
        walk_in_pct: a.walkInPct,
        budget: a.budget,
        answers: a,
        report,
        engine: outcome.engine,
        model: outcome.model,
        recommended_service: report.recommendation.packageId,
        currency: report.estimate.currency,
        estimate_min: report.estimate.oneTimeMin,
        estimate_max: report.estimate.oneTimeMax,
        monthly_min: report.estimate.monthlyMin,
        monthly_max: report.estimate.monthlyMax,
      })
      .select("id")
      .single();
    if (error) throw error;
    id = data.id;
  } catch (error) {
    console.error("[analyzer] insert failed:", error instanceof Error ? error.message : error);
  }

  const sent = await deliverEstimate({ id, email, contactName: a.contactName, businessName: a.businessName, report });

  // Heads-up to the team (best effort).
  const teamInbox = process.env.LEAD_NOTIFICATION_TO;
  if (teamInbox && emailConfigured() && id) {
    const note = analysisNotificationEmail({ id, ...a, email, report });
    const res = await sendEmail({ to: teamInbox, ...note, replyTo: email });
    if (!res.ok) console.error("[analyzer] team notification failed:", res.error);
  }

  return { status: "success", report, emailed: sent.ok };
}

async function tooManyFromEmail(email: string): Promise<boolean> {
  if (!process.env.SUPABASE_SECRET_KEY) return false;
  const since = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
  const { count, error } = await createAdminClient()
    .from("business_analyses")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  if (error) {
    console.error("[analyzer] rate check failed:", error.message);
    return false;
  }
  return (count ?? 0) >= MAX_PER_EMAIL_PER_DAY;
}
