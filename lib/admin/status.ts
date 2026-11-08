import type { LeadStatus } from "@/lib/supabase/database.types";

export const leadStatuses: { value: LeadStatus; label: string; className: string }[] = [
  { value: "new", label: "New", className: "bg-brand-soft text-brand" },
  { value: "contacted", label: "Contacted", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { value: "qualified", label: "Qualified", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { value: "won", label: "Won", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { value: "lost", label: "Lost", className: "bg-secondary text-muted-foreground" },
  { value: "spam", label: "Spam", className: "bg-destructive/10 text-destructive" },
];

export function isLeadStatus(v: string | undefined): v is LeadStatus {
  return leadStatuses.some((s) => s.value === v);
}
