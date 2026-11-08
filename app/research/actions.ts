"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logEntrySchema, type LogEntry } from "@/lib/research/config";
import { researchContext } from "@/lib/research/data";
import { findSensitive } from "@/lib/research/privacy";

export type Result = { ok: true; message?: string } | { ok: false; message: string };

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const observerSchema = z.string().trim().min(1).max(60).transform((s) => (s.toLowerCase() === "me" ? "me" : s));
const scoreSchema = z.number().int().min(1).max(5).nullable();

/** Rejects any free text that looks like a taxpayer identifier. */
function guard(...texts: (string | null | undefined)[]): Result | null {
  for (const t of texts) {
    const hits = findSensitive(t ?? "");
    if (hits.length) return { ok: false, message: `Not saved: remove ${hits.map((h) => h.label).join(", ")}. Record the process, not the taxpayer.` };
  }
  return null;
}

const done = (message = "Saved."): Result => {
  revalidatePath("/research", "layout");
  return { ok: true, message };
};

/* ───────────── Daily logs ───────────── */

export async function saveLog(date: string, observer: string, entry: LogEntry): Promise<Result> {
  const d = isoDate.safeParse(date);
  const o = observerSchema.safeParse(observer);
  const e = logEntrySchema.safeParse(entry);
  if (!d.success || !o.success) return { ok: false, message: "Invalid date or observer." };
  if (!e.success) return { ok: false, message: e.error.issues[0]?.message ?? "Check the log fields." };

  const { supabase } = await researchContext();
  const { error } = await supabase
    .from("research_logs")
    .upsert({ log_date: d.data, observer: o.data, entry: e.data, pain_score: e.data.painScore }, { onConflict: "user_id,observer,log_date" });
  if (error) return { ok: false, message: error.message };
  return done("Log saved.");
}

export async function deleteLog(date: string, observer: string): Promise<Result> {
  const d = isoDate.safeParse(date);
  const o = observerSchema.safeParse(observer);
  if (!d.success || !o.success) return { ok: false, message: "Invalid log." };
  const { supabase } = await researchContext();
  const { error } = await supabase.from("research_logs").delete().eq("log_date", d.data).eq("observer", o.data);
  if (error) return { ok: false, message: error.message };
  return done("Log deleted.");
}

/* ───────────── Calendar days ───────────── */

export async function addCalendarDay(date: string): Promise<Result> {
  const d = isoDate.safeParse(date);
  if (!d.success || Number.isNaN(Date.parse(d.data))) return { ok: false, message: "Pick a valid date." };
  const { supabase } = await researchContext();
  const { error } = await supabase.from("research_days").upsert({ day: d.data }, { onConflict: "user_id,day", ignoreDuplicates: true });
  if (error) return { ok: false, message: /research_days/.test(error.message) ? "Run the research_days migration first." : error.message };
  return done("Added to your calendar.");
}

export async function removeCalendarDay(date: string): Promise<Result> {
  const d = isoDate.safeParse(date);
  if (!d.success) return { ok: false, message: "Invalid date." };
  const { supabase } = await researchContext();
  const { error } = await supabase.from("research_days").delete().eq("day", d.data);
  if (error) return { ok: false, message: error.message };
  return done("Removed from your calendar.");
}

/* ───────────── Process map ───────────── */

const stepSchema = z.object({
  title: z.string().trim().min(1).max(200),
  tool: z.string().trim().max(200),
  owner: z.string().trim().max(200),
  notes: z.string().trim().max(4000),
  keywords: z.array(z.string().trim().min(2).max(40)).max(20),
});

export async function saveStep(id: string | null, input: z.input<typeof stepSchema>): Promise<Result> {
  const s = stepSchema.safeParse(input);
  if (!s.success) return { ok: false, message: "Check the step fields." };
  const blocked = guard(s.data.title, s.data.tool, s.data.owner, s.data.notes);
  if (blocked) return blocked;

  const { supabase } = await researchContext();
  const row = { ...s.data, tool: s.data.tool || null, owner: s.data.owner || null, notes: s.data.notes || null };
  if (id) {
    const { error } = await supabase.from("research_process_steps").update(row).eq("id", id);
    if (error) return { ok: false, message: error.message };
  } else {
    const { count } = await supabase.from("research_process_steps").select("id", { count: "exact", head: true });
    const { error } = await supabase.from("research_process_steps").insert({ ...row, position: (count ?? 0) + 1 });
    if (error) return { ok: false, message: error.message };
  }
  return done("Step saved.");
}

export async function deleteStep(id: string): Promise<Result> {
  const { supabase } = await researchContext();
  const { error } = await supabase.from("research_process_steps").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  return done("Step removed.");
}

export async function moveStep(id: string, direction: -1 | 1): Promise<Result> {
  const { supabase } = await researchContext();
  const { data } = await supabase.from("research_process_steps").select("id, position").order("position");
  const steps = data ?? [];
  const i = steps.findIndex((s) => s.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= steps.length) return { ok: true };
  [steps[i], steps[j]] = [steps[j], steps[i]];
  await Promise.all(steps.map((s, k) => supabase.from("research_process_steps").update({ position: k + 1 }).eq("id", s.id)));
  return done("Moved.");
}

/* ───────────── Questions ───────────── */

const sourceSchema = z.enum(["guide", "weekly", "map", "manual"]);

export async function addQuestions(questions: string[], source: z.infer<typeof sourceSchema> = "manual"): Promise<Result> {
  const qs = z.array(z.string().trim().min(3).max(500)).min(1).max(20).safeParse(questions);
  const src = sourceSchema.safeParse(source);
  if (!qs.success || !src.success) return { ok: false, message: "Write a question first." };
  const blocked = guard(...qs.data);
  if (blocked) return blocked;

  const { supabase } = await researchContext();
  const { data: existing } = await supabase.from("research_questions").select("question");
  const seen = new Set((existing ?? []).map((q) => q.question.toLowerCase()));
  const fresh = qs.data.filter((q) => !seen.has(q.toLowerCase()));
  if (!fresh.length) return { ok: true, message: "Already on your list." };
  const { error } = await supabase.from("research_questions").insert(fresh.map((question) => ({ question, source: src.data })));
  if (error) return { ok: false, message: error.message };
  return done(`Added ${fresh.length} question${fresh.length === 1 ? "" : "s"}.`);
}

export async function updateQuestion(id: string, status: "open" | "asked" | "answered", answer: string): Promise<Result> {
  const s = z.enum(["open", "asked", "answered"]).safeParse(status);
  const a = z.string().trim().max(4000).safeParse(answer);
  if (!s.success || !a.success) return { ok: false, message: "Invalid update." };
  const blocked = guard(a.data);
  if (blocked) return blocked;
  const { supabase } = await researchContext();
  const { error } = await supabase.from("research_questions").update({ status: s.data, answer: a.data || null }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return done();
}

export async function deleteQuestion(id: string): Promise<Result> {
  const { supabase } = await researchContext();
  const { error } = await supabase.from("research_questions").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  return done("Removed.");
}

/* ───────────── Weekly review ───────────── */

export async function saveWeekly(weekStart: string, notes: Record<string, string>): Promise<Result> {
  const w = isoDate.safeParse(weekStart);
  const n = z.record(z.string(), z.string().max(4000)).safeParse(notes);
  if (!w.success || !n.success) return { ok: false, message: "Invalid review." };
  const blocked = guard(...Object.values(n.data));
  if (blocked) return blocked;
  const { supabase } = await researchContext();
  const { error } = await supabase
    .from("research_weekly_reviews")
    .upsert({ week_start: w.data, notes: n.data }, { onConflict: "user_id,week_start" });
  if (error) return { ok: false, message: error.message };
  return done("Weekly review saved.");
}

/* ───────────── Candidate problems ───────────── */

const candidateSchema = z.object({
  key: z.string().min(1).max(200),
  title: z.string().trim().min(2).max(300),
  frequency: scoreSchema,
  pain: scoreSchema,
  buildable: scoreSchema,
  safe: scoreSchema,
  dismissed: z.boolean(),
  chosen: z.boolean(),
  summary: z.object({ problem: z.string().max(3000), affects: z.string().max(3000), observed: z.string().max(3000), fix: z.string().max(3000) }).nullable(),
});

export async function saveCandidate(input: z.input<typeof candidateSchema>): Promise<Result> {
  const c = candidateSchema.safeParse(input);
  if (!c.success) return { ok: false, message: "Check the scores." };
  const blocked = guard(c.data.title, ...(c.data.summary ? Object.values(c.data.summary) : []));
  if (blocked) return blocked;

  const { supabase } = await researchContext();
  if (c.data.chosen) await supabase.from("research_candidates").update({ chosen: false }).neq("key", c.data.key);
  const { error } = await supabase.from("research_candidates").upsert(c.data, { onConflict: "user_id,key" });
  if (error) return { ok: false, message: error.message };
  return done(c.data.chosen ? "Chosen. Summary saved." : "Saved.");
}

export async function addManualCandidate(title: string): Promise<Result> {
  const t = z.string().trim().min(3).max(300).safeParse(title);
  if (!t.success) return { ok: false, message: "Describe the problem first." };
  const blocked = guard(t.data);
  if (blocked) return blocked;
  const { supabase } = await researchContext();
  const { error } = await supabase
    .from("research_candidates")
    .insert({ key: `manual:${crypto.randomUUID()}`, title: t.data, buildable: 3, safe: 3, frequency: 1, pain: 1 });
  if (error) return { ok: false, message: error.message };
  return done("Added.");
}
