import "server-only";

import { cache } from "react";

import { requireResearcher } from "./auth";

import type { LogRecord, StepRecord } from "./analysis";
import { defaultQuestions, defaultSteps, readEntry } from "./config";

/** Session client for the signed-in researcher. RLS limits every query to their own rows. */
export const researchContext = requireResearcher;

export const getLogs = cache(async (): Promise<LogRecord[]> => {
  const { supabase } = await researchContext();
  const { data, error } = await supabase
    .from("research_logs")
    .select("log_date, observer, entry")
    .order("log_date", { ascending: true });
  if (error) throw new Error(`Couldn't load logs: ${error.message}. Have you run the research migration?`);
  return (data ?? []).map((r) => ({ date: r.log_date, observer: r.observer, entry: readEntry(r.entry) }));
});

/** Process steps; seeds the guide's 7 steps the first time. */
export const getSteps = cache(async (): Promise<(StepRecord & { notes: string | null; position: number })[]> => {
  const { supabase } = await researchContext();
  const load = () => supabase.from("research_process_steps").select("id, title, tool, owner, notes, keywords, position").order("position");
  let { data, error } = await load();
  if (error) throw new Error(`Couldn't load the process map: ${error.message}`);
  if (!data?.length) {
    await supabase.from("research_process_steps").insert(defaultSteps.map((s, i) => ({ title: s.title, keywords: s.keywords, position: i + 1 })));
    ({ data, error } = await load());
  }
  return data ?? [];
});

/** Questions; seeds the guide's staff questions the first time. */
export const getQuestions = cache(async () => {
  const { supabase } = await researchContext();
  const load = () => supabase.from("research_questions").select("id, question, source, status, answer, created_at").order("created_at");
  const first = await load();
  if (first.error) throw new Error(`Couldn't load questions: ${first.error.message}`);
  if (first.data?.length) return first.data;
  await supabase.from("research_questions").insert(defaultQuestions.map((q) => ({ question: q, source: "guide" as const })));
  return (await load()).data ?? [];
});

export const getWeekly = cache(async (weekStart: string) => {
  const { supabase } = await researchContext();
  const { data } = await supabase.from("research_weekly_reviews").select("notes, updated_at").eq("week_start", weekStart).maybeSingle();
  return data;
});

export const getCandidateOverrides = cache(async () => {
  const { supabase } = await researchContext();
  const { data } = await supabase.from("research_candidates").select("*");
  return data ?? [];
});

/** Extra calendar dates added with "Add to calendar". Empty if the table isn't there yet. */
export const getCustomDays = cache(async (): Promise<string[]> => {
  const { supabase } = await researchContext();
  const { data, error } = await supabase.from("research_days").select("day").order("day");
  if (error) return [];
  return (data ?? []).map((d) => d.day);
});
