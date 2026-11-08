import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, ClipboardList, Flame, ListChecks, MessageCircleQuestion } from "lucide-react";

import { ObservationCalendar } from "@/components/research/calendar";
import { AddCalendarDay } from "@/components/research/editors";
import { Button } from "@/components/ui/button";
import { candidates, cluster, formatDay, isWorkingDay, itemsOf, nextActions, todayAccra, total, workingDays } from "@/lib/research/analysis";
import { study, toolOptions } from "@/lib/research/config";
import { getCustomDays, getLogs, getQuestions } from "@/lib/research/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function ResearchOverview() {
  const [logs, questions, customDays] = await Promise.all([getLogs(), getQuestions(), getCustomDays()]);
  const mine = logs.filter((l) => l.observer === "me");
  const today = todayAccra();
  const days = workingDays();
  const added = new Set(customDays);
  const scheduled = new Set([...days, ...customDays]);
  const logged = new Map(mine.map((l) => [l.date, l.entry.painScore ?? 0]));
  const due = [...scheduled].filter((d) => d <= today);
  const todaysLog = mine.find((l) => l.date === today);
  const todayScheduled = scheduled.has(today);
  const actions = nextActions(logs, today, customDays).filter((a) => !a.href.endsWith(`/log/${today}`));

  const pains = mine.map((l) => l.entry.painScore).filter((p): p is number => p != null);
  const topTasks = cluster(itemsOf(mine, ["task", "seen"])).sort((a, b) => b.days.length - a.days.length).slice(0, 5);
  const toolCounts = toolOptions
    .map((t) => ({ label: t.label, n: mine.filter((l) => l.entry.tools.includes(t.value)).length }))
    .filter((t) => t.n)
    .sort((a, b) => b.n - a.n);
  const allCandidates = candidates(logs);
  const openQs = questions.filter((q) => q.status !== "answered").length;

  const stats = [
    { icon: CalendarCheck, label: "Days logged", value: `${due.filter((d) => logged.has(d)).length}/${due.length || days.length}` },
    { icon: Flame, label: "Avg pain", value: pains.length ? (pains.reduce((a, b) => a + b, 0) / pains.length).toFixed(1) : "—" },
    { icon: ListChecks, label: "Problems found", value: allCandidates.length },
    { icon: MessageCircleQuestion, label: "Open questions", value: openQs },
  ];

  return (
    <>
      {/* Today */}
      <section
        className={cn(
          "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
          todaysLog ? "border-primary/40 bg-brand-soft" : "border-primary/60 bg-card",
        )}
      >
        <div className="flex items-center gap-3">
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", todaysLog ? "bg-primary text-primary-foreground" : "bg-brand-soft text-brand")}>
            {todaysLog ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <ClipboardList className="size-5" aria-hidden="true" />}
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Today · {formatDay(today)}</p>
            <p className="font-semibold">
              {todaysLog
                ? "Today's log is saved"
                : today < study.start
                  ? `Observation starts ${formatDay(study.start)}`
                  : todayScheduled || isWorkingDay(today)
                    ? "Write today's log, 5 minutes"
                    : "No observation scheduled today"}
            </p>
          </div>
        </div>
        <Button asChild size="lg" variant={todaysLog ? "outline" : "default"} className="w-full sm:w-auto">
          <Link href={`/research/log/${today}`}>
            {todaysLog ? "Edit today's log" : "Write today's log"} <ArrowRight />
          </Link>
        </Button>
      </section>

      {actions.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Next steps">
          {actions.map((a) => (
            <Link
              key={a.href + a.label}
              href={a.href}
              className={cn(
                "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors active:scale-[0.99]",
                a.tone === "primary" ? "border-primary/50 bg-brand-soft font-medium" : "border-border bg-card hover:border-brand/40",
              )}
            >
              {a.label} <ArrowRight className="size-4 shrink-0 text-brand" aria-hidden="true" />
            </Link>
          ))}
        </section>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:flex-col sm:items-start sm:gap-1.5 sm:p-4">
            <s.icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-display text-xl font-semibold tabular-nums sm:text-2xl">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-3 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="px-1">
            <h2 className="font-semibold">Observation calendar</h2>
            <p className="text-xs text-muted-foreground">
              {formatDay(study.start)} – {formatDay(study.end)} · tap a day to log it
            </p>
          </div>
          <AddCalendarDay today={today} />
        </div>
        <ObservationCalendar today={today} scheduled={scheduled} added={added} logged={logged} />
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold">Most frequent tasks</h2>
          {topTasks.length ? (
            <ul className="flex flex-col gap-2 text-sm">
              {topTasks.map((t) => (
                <li key={t.key} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">{t.label}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">{t.days.length}d</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Appears after your first logs.</p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold">Tools the unit relies on</h2>
          {toolCounts.length ? (
            <ul className="flex flex-col gap-2 text-sm">
              {toolCounts.map((t) => (
                <li key={t.label} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 truncate">{t.label}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(t.n / Math.max(1, mine.length)) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right text-muted-foreground tabular-nums">{t.n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Tick tools in your daily log.</p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Leading problems</h2>
            <Link href="/research/problems" className="py-1 text-xs text-brand hover:underline">
              Score all
            </Link>
          </div>
          {allCandidates.length ? (
            <ol className="flex flex-col gap-2 text-sm">
              {allCandidates.slice(0, 3).map((c, i) => (
                <li key={c.key} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {i + 1}. {c.title}
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">{total(c.auto)}/20</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Built from delays, repeated work, mistakes and pain in your logs.</p>
          )}
        </section>
      </div>

      <p className="px-1 text-xs text-muted-foreground">
        Problem choice opens {formatDay(study.chooseFrom)}. Everything is calculated from your own logs; nothing is sent to AI tools.
      </p>
    </>
  );
}
