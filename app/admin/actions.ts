"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/auth";
import { deliverEstimate } from "@/lib/analyzer/deliver";
import type { AnalysisReport } from "@/lib/analyzer/report";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { ok: boolean; message: string } | null;

/* ───────────── Auth ───────────── */

const CONFIG_MESSAGE =
  "Supabase isn't configured on this deployment. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY in Vercel → Settings → Environment Variables, then redeploy.";

const loginSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(6).max(200),
});

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, message: "Enter your email and password." };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return { ok: false, message: CONFIG_MESSAGE };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: "Incorrect email or password." };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, message: "This account doesn't have admin access." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ───────────── Leads & analyses ───────────── */

const statusSchema = z.enum(["new", "contacted", "qualified", "won", "lost", "spam"]);
const updateSchema = z.object({
  id: z.uuid(),
  status: statusSchema,
  notes: z.string().max(5000).optional(),
});

async function updateRow(table: "leads" | "business_analyses", formData: FormData): Promise<ActionState> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) return { ok: false, message: "Invalid update." };

  const { supabase } = await requireAdmin();
  const { id, status, notes } = parsed.data;
  const { error } = await supabase
    .from(table)
    .update({ status, notes: notes?.trim() || null })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  const base = table === "leads" ? "/admin/leads" : "/admin/analyses";
  revalidatePath(base);
  revalidatePath(`${base}/${id}`);
  revalidatePath("/admin");
  return { ok: true, message: "Saved." };
}

export async function updateLead(_prev: ActionState, formData: FormData) {
  return updateRow("leads", formData);
}

export async function updateAnalysis(_prev: ActionState, formData: FormData) {
  return updateRow("business_analyses", formData);
}

export async function resendEstimate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { ok: false, message: "Invalid analysis." };

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("business_analyses")
    .select("id, email, contact_name, business_name, report")
    .eq("id", id.data)
    .single();
  if (error || !data) return { ok: false, message: "Analysis not found." };

  const result = await deliverEstimate({
    id: data.id,
    email: data.email,
    contactName: data.contact_name,
    businessName: data.business_name,
    report: data.report as unknown as AnalysisReport,
  });
  revalidatePath(`/admin/analyses/${data.id}`);
  return result.ok ? { ok: true, message: `Estimate sent to ${data.email}.` } : { ok: false, message: result.error };
}
