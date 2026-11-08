import Link from "next/link";
import { ArrowRight, CalendarCheck, Flame, ListChecks, MessageCircleQuestion, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { candidates, cluster, formatDay, itemsOf, nextActions, todayAccra, total, workingDays } from "@/lib/research/analysis";
import { study, toolOptions } from "@/lib/research/config";
import { getLogs, getQuestions } from "@/lib/research/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function ResearchOverview() {
  const [logs, questions] = await Promise.all([getLogs(), getQuestions()]);
  const mine = logs.filter((l) => l.observer === "me");
  const today = todayAccra();
  const days = workingDays();
  // Working days plus any extra dates you've logged (weekends, before/after the study).
  const calendarDays = [...new Set([...days, ...mine.map((l) => l.date)])].sort();
  const byDate = new Map(mine.map((l) => [l.date, l]));
  const due = days.filter((d) => d <= today);
  const actions = nextActions(logs, today);

  const pains = mine.map((l) => l.entry.painScore).filter((p): p is number => p != null);
  const topTasks = cluster(itemsOf(mine, ["task", "seen"])).sort((a, b) => b.days.length - a.days.length).slice(0, 5);
  const toolCounts = toolOptions
    .map((t) => ({ label: t.label, n: mine.filter((l) => l.entry.tools.includes(t.value)).length }))
    .filter((t) => t.n)
    .sort((a, b) => b.n - a.n);
  const leading = candidates(logs).slice(0, 3);
  const openQs = questions.filter((q) => q.status !== "answered").length;

  const stats = [
    { icon: CalendarCheck, label: "Days logged", value: `${due.filter((d) => byDate.has(d)).length}/${due.length || days.length}` },
    { icon: Flame, label: "Average pain", value: pains.length ? (pains.reduce((a, b) => a + b, 0) / pains.length).toFixed(1) : "—" },
    { icon: ListChecks, label: "Candidate problems", value: candidates(logs).length },
    { icon: MessageCircleQuestion, label: "Open questions", value: openQs },
  ];

  return (
    <>
      {actions.length > 0 && (
        <section className="flex flex-col gap-2">
          {actions.map((a) => (
            <Link
              key={a.href + a.label}
              href={a.href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                a.tone === "primary" ? "border-primary/50 bg-brand-soft font-medium hover:border-primary" : "border-border bg-card hover:border-brand/40",
              )}
            >
              {a.label} <ArrowRight className="size-4 shrink-0 text-brand" aria-hidden="true" />
            </Link>
          ))}
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4">
            <s.icon className="size-4 text-brand" aria-hidden="true" />
            <span className="font-display text-2xl font-semibold tabular-nums">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar: every working day of the study, with pain bars */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Observation calendar</h2>
            <span className="text-xs text-muted-foreground">Bar height = pain score</span>
          </div>
          <form action="/research/log/go" className="flex items-center gap-2">
            <label htmlFor="log-date" className="sr-only">
              Date to log
            </label>
            <input
              id="log-date"
              name="d"
              type="date"
              required
              defaultValue={today}
              max={today}
              className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
            />
            <Button type="submit" size="sm">
              <Plus /> Add log
            </Button>
          </form>
        </div>
        <ol className="grid grid-cols-5 gap-2">
          {calendarDays.map((d) => {
            const log = byDate.get(d);
            const past = d < today;
            const isToday = d === today;
            const pain = log?.entry.painScore ?? 0;
            return (
              <li key={d}>
                <Link
                  href={`/research/log/${d}`}
                  className={cn(
                    "flex h-20 flex-col justify-between rounded-lg border p-2 text-xs transition-colors hover:border-brand/40",
                    log ? "border-primary/40 bg-brand-soft" : past ? "border-destructive/40 bg-destructive/5" : "border-border",
                    isToday && "ring-2 ring-primary",
                  )}
                  aria-label={`${formatDay(d)}: ${log ? `logged, pain ${pain || "not set"}` : past ? "missed" : "upcoming"}`}
                >
                  <span className={cn(!log && !past && "text-muted-foreground")}>{formatDay(d)}</span>
                  <span className="flex items-end gap-1">
                    <span className="h-7 w-2 overflow-hidden rounded-sm bg-secondary">
                      <span className="block w-full rounded-sm bg-primary" style={{ height: `${pain * 20}%`, marginTop: `${100 - pain * 20}%` }} />
                    </span>
                    <span className="text-muted-foreground">{log ? (pain ? `${pain}/5` : "✓") : past ? "missed" : ""}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold">Most frequent tasks</h2>
          {topTasks.length ? (
            <ul className="flex flex-col gap-1.5 text-sm">
              {topTasks.map((t) => (
                <li key={t.key} className="flex justify-between gap-2">
                  <span className="truncate">{t.label}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">{t.days.length}d</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Appears after your first logs.</p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold">Tools the unit relies on</h2>
          {toolCounts.length ? (
            <ul className="flex flex-col gap-1.5 text-sm">
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

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Leading problems</h2>
            <Link href="/research/problems" className="text-xs text-brand hover:underline">
              Score all
            </Link>
          </div>
          {leading.length ? (
            <ol className="flex flex-col gap-1.5 text-sm">
              {leading.map((c, i) => (
                <li key={c.key} className="flex justify-between gap-2">
                  <span className="truncate">
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

      <p className="text-xs text-muted-foreground">
        Problem choice opens {formatDay(study.chooseFrom)}. Everything here is calculated from your own logs; nothing is sent to AI tools.
      </p>
    </>
  );
}
