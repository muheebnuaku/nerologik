"use server";

import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/server";
import { newsletterSchema } from "@/lib/validations/newsletter";

export type NewsletterState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const SUCCESS = "You're on the list. Thanks for subscribing!";

export async function subscribeNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    website: String(formData.get("website") ?? ""),
  });
  if (!parsed.success) return { status: "error", message: "Enter a valid email address." };

  // Honeypot filled: pretend it worked, store nothing.
  if (parsed.data.website) return { status: "success", message: SUCCESS };

  if (!rateLimit(`newsletter:${await clientIp()}`, 5, 10 * 60_000)) {
    return { status: "error", message: "Too many attempts. Please try again in a few minutes." };
  }

  const { error } = await createPublicClient()
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.email.toLowerCase(), source: "website:footer" });

  // 23505 = already subscribed. Same reply either way, so addresses can't be probed.
  if (error && error.code !== "23505") {
    console.error("[newsletter] insert failed:", error.message);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  return { status: "success", message: SUCCESS };
}
