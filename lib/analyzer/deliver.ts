import "server-only";

import { estimateEmail } from "@/lib/email/estimate-email";
import { sendEmail, type SendResult } from "@/lib/email/send";
import { siteConfig } from "@/lib/site-config";
import { createAdminClient } from "@/lib/supabase/admin";

import type { AnalysisReport } from "./report";

/** Emails the estimate to the client and records the outcome on the row (if any). */
export async function deliverEstimate(args: {
  id: string | null;
  email: string;
  contactName: string;
  businessName: string;
  report: AnalysisReport;
}): Promise<SendResult> {
  const { subject, html, text } = estimateEmail(args);
  const result = await sendEmail({
    to: args.email,
    subject,
    html,
    text,
    replyTo: process.env.LEAD_NOTIFICATION_TO || siteConfig.email,
  });

  if (args.id) {
    const { error } = await createAdminClient()
      .from("business_analyses")
      .update(
        result.ok
          ? { email_sent_at: new Date().toISOString(), email_error: null }
          : { email_error: result.error.slice(0, 500) },
      )
      .eq("id", args.id);
    if (error) console.error("[analyzer] could not record email status:", error.message);
  }

  if (!result.ok) console.error("[analyzer] estimate email failed:", result.error);
  return result;
}
