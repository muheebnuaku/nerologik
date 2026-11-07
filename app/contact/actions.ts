"use server";

import { z } from "zod";

import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/server";
import { leadSchema, type LeadInput } from "@/lib/validations/lead";

export type LeadResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<keyof LeadInput, string[]>> };

const SUCCESS_MESSAGE = "Thanks! We've got your message and will reply within 24 hours.";
const FAILURE_MESSAGE =
  "Something went wrong sending your message. Please try again, or reach us on WhatsApp or by email.";
const TOO_MANY_MESSAGE =
  "You've sent several messages in a short time. Please wait a little, or reach us on WhatsApp.";

/** The same address may submit at most this many leads per hour. */
const MAX_PER_EMAIL_PER_HOUR = 3;

/**
 * Stores a contact-form lead in Supabase `leads`.
 * The insert uses the publishable key, so RLS and column grants apply: the
 * public can only insert the form fields, never read leads or set status/notes.
 * Email notifications are intentionally off for now.
 */
export async function submitLead(input: unknown): Promise<LeadResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { website, ...lead } = parsed.data;

  // Honeypot filled: almost certainly a bot. Pretend it worked, store nothing.
  if (website) return { status: "success", message: SUCCESS_MESSAGE };

  if (!rateLimit(`lead:${await clientIp()}`, 5, 10 * 60_000)) {
    return { status: "error", message: TOO_MANY_MESSAGE };
  }

  const email = lead.email.trim().toLowerCase();

  try {
    if (await tooManyFromEmail(email)) return { status: "error", message: TOO_MANY_MESSAGE };

    const { error } = await createPublicClient()
      .from("leads")
      .insert({
        name: lead.name.trim(),
        email,
        company: lead.company?.trim() || null,
        service: lead.service,
        budget: lead.budget,
        message: lead.message.trim(),
        source: "website:contact",
      });
    if (error) throw error;
  } catch (error) {
    console.error("[lead] insert failed:", error instanceof Error ? error.message : error);
    return { status: "error", message: FAILURE_MESSAGE };
  }

  return { status: "success", message: SUCCESS_MESSAGE };
}

/** Durable per-email limit. Needs the server secret key; skipped if it isn't set. */
async function tooManyFromEmail(email: string): Promise<boolean> {
  if (!process.env.SUPABASE_SECRET_KEY) return false;
  const since = new Date(Date.now() - 60 * 60_000).toISOString();
  const { count, error } = await createAdminClient()
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  if (error) {
    console.error("[lead] rate check failed:", error.message);
    return false;
  }
  return (count ?? 0) >= MAX_PER_EMAIL_PER_HOUR;
}
