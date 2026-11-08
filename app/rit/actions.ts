"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { clientIp, rateLimit } from "@/lib/rate-limit";
import { normalizePhone, phoneLoginEmail } from "@/lib/rit/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type RitState = { ok: boolean; message: string } | null;

const CONFIG = "Accounts aren't available yet: the server isn't fully configured. Please tell the team.";

const configured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !!process.env.SUPABASE_SECRET_KEY;

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().min(6, "Enter your phone number").max(30),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  code: z.string().trim().max(60).optional(),
});

export async function signUp(_prev: RitState, formData: FormData): Promise<RitState> {
  if (!configured()) return { ok: false, message: CONFIG };
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    code: formData.get("code") ?? undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  // Optional team code, so only invited people can join (set RIT_INVITE_CODE).
  const invite = process.env.RIT_INVITE_CODE;
  if (invite && parsed.data.code !== invite) return { ok: false, message: "That team code isn't right. Ask your team lead for it." };

  if (!rateLimit(`rit-signup:${await clientIp()}`, 5, 60 * 60_000)) {
    return { ok: false, message: "Too many sign-ups from this device. Try again later." };
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return { ok: false, message: "Enter a valid phone number, e.g. 024 123 4567 or +233 24 123 4567." };

  const db = createAdminClient();
  const { data: existing } = await db.from("rit_members").select("user_id").eq("phone", phone).maybeSingle();
  if (existing) return { ok: false, message: "An account with this number already exists. Log in instead." };

  const { data: created, error } = await db.auth.admin.createUser({
    email: phoneLoginEmail(phone),
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: parsed.data.name, phone, rit: true },
  });
  if (error || !created.user) {
    const taken = /already|registered|exists/i.test(error?.message ?? "");
    return { ok: false, message: taken ? "An account with this number already exists. Log in instead." : "Couldn't create your account. Please try again." };
  }

  const { error: memberError } = await db.from("rit_members").insert({ user_id: created.user.id, name: parsed.data.name, phone });
  if (memberError) {
    await db.auth.admin.deleteUser(created.user.id);
    console.error("[rit] member insert failed:", memberError.message);
    return { ok: false, message: "Couldn't create your account. Please try again." };
  }

  const supabase = await createClient();
  const { error: loginError } = await supabase.auth.signInWithPassword({ email: phoneLoginEmail(phone), password: parsed.data.password });
  if (loginError) return { ok: true, message: "Account created. Log in with your number and password." };
  redirect("/research");
}

const loginSchema = z.object({
  phone: z.string().trim().min(6).max(30),
  password: z.string().min(1).max(72),
});

export async function logIn(_prev: RitState, formData: FormData): Promise<RitState> {
  if (!configured()) return { ok: false, message: CONFIG };
  const parsed = loginSchema.safeParse({ phone: formData.get("phone"), password: formData.get("password") });
  const phone = parsed.success ? normalizePhone(parsed.data.phone) : null;
  if (!parsed.success || !phone) return { ok: false, message: "Enter your phone number and password." };

  if (!rateLimit(`rit-login:${await clientIp()}`, 10, 15 * 60_000)) {
    return { ok: false, message: "Too many attempts. Wait a few minutes and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: phoneLoginEmail(phone), password: parsed.data.password });
  if (error) return { ok: false, message: "Wrong phone number or password." };
  redirect("/research");
}

export async function signOutResearcher() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/rit");
}
