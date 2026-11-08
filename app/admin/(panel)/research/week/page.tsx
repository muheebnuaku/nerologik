import Link from "next/link";

import { AddQuestionsButton, WeeklyEditor } from "@/components/research/editors";
import {
  draftWeekly,
  formatDay,
  gapQuestions,
  stepEvidence,
  studyWeeks,
  todayAccra,
  weekEnd,
  weekStart,
  weeklyStats,
  type ItemKind,
} from "@/lib/research/analysis";
import { getLogs, getQuestions, getSteps, getWeekly } from "@/lib/research/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Weekly review" };

const themeTitle: Partial<Record<ItemKind, string>> = {
  delay: "Waiting and delays",
  repeated: "Repeated work",
  mistake: "Mistakes or rework",
  question: "Questions people kept asking",
  complaint: "Complaints",
};

type Props = { searchParams: Promise<{ w?: string }> };

export default async function WeekPage({ searchParams }: Props) {
  const { w } = await searchParams;
  const weeks = studyWeeks();
  const current = weekStart(todayAccra());
  const monday = w && weeks.includes(w) ? w : weeks.includes(current) ? current : weeks[0];

  const [logs, steps, questions, saved] = await Promise.all([getLogs(), getSteps(), getQuestions(), getWeekly(monday)]);
  const stats = weeklyStats(logs, monday);
  const evidence = stepEvidence(steps, logs);
  const gapQs = gapQuestions(steps, evidence);
  const openQs = questions.filter((q) => q.status === "open" && q.source !== "guide").map((q) => q.question);
  const draft = draftWeekly(stats, gapQs, openQs);
  const suggested = draft.unknowns
    .split("\n")
    .map((l) => l.replace(/^\d+\.\s*/, "").trim())
    .filter((l) => l.length > 3);

  return (
    <>
      <nav aria-label="Weeks" className="flex flex-wrap gap-1.5">
        {weeks.map((wk, i) => (
          <Link
            key={wk}
            href={`/admin/research/week?w=${wk}`}
            aria-current={wk === monday ? "page" : undefined}
            className={cn("rounded-lg border px-3 py-1.5 text-sm", wk === monday ? "border-primary bg-brand-soft" : "border-border text-muted-foreground hover:text-foreground")}
          >
            Week {i + 1} · {formatDay(wk)}
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Auto-computed evidence */}
        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">
              {formatDay(monday)} – {formatDay(weekEnd(monday))}
            </h2>
            <p className="text-sm text-muted-foreground">
              Logged {stats.loggedDays.length} of {stats.workingDays.length} days
              {stats.missingDays.length ? ` · missed ${stats.missingDays.map(formatDay).join(", ")}` : ""}
              {stats.avgPain ? ` · average pain ${stats.avgPain}/5` : ""}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 font-medium">Tasks by frequency</h3>
            {stats.topTasks.length ? (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-1 font-normal">Task</th>
                    <th className="pb-1 text-right font-normal">Days</th>
                    <th className="pb-1 text-right font-normal">Items</th>
                    <th className="pb-1 text-right font-normal">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topTasks.map((t) => (
                    <tr key={t.label} className="border-t border-border">
                      <td className="py-1.5 pr-2">
                        {t.label}
                        <span className="block text-xs text-muted-foreground">{t.roles.join(", ")}</span>
                      </td>
                      <td className="text-right tabular-nums">{t.mentions}</td>
                      <td className="text-right tabular-nums">{t.items || "—"}</td>
                      <td className="text-right tabular-nums">{t.minutes ? (t.minutes / 60).toFixed(1) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks logged this week yet.</p>
            )}
          </div>

          {stats.themes
            .filter((t) => t.clusters.length)
            .map((t) => (
              <div key={t.kind} className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-2 font-medium">{themeTitle[t.kind]}</h3>
                <ul className="flex flex-col gap-1 text-sm">
                  {t.clusters.map((c) => (
                    <li key={c.key} className="flex justify-between gap-2">
                      <span>{c.label}</span>
                      {c.items.length > 1 && <span className="shrink-0 text-xs text-muted-foreground">×{c.items.length}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          {stats.learned.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 font-medium">What I learned</h3>
              <ul className="flex flex-col gap-1 text-sm">
                {stats.learned.map((l) => (
                  <li key={l.date}>
                    <span className="text-muted-foreground">{formatDay(l.date)}:</span> {l.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Editable review */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 lg:sticky lg:top-6 lg:self-start">
          <div>
            <h2 className="font-semibold">Friday review</h2>
            <p className="text-sm text-muted-foreground">
              {saved ? `Saved ${new Date(saved.updated_at).toLocaleDateString("en-GB")}.` : "Pre-filled from your logs and process-map gaps."}
            </p>
          </div>
          <WeeklyEditor key={monday} weekStart={monday} draft={draft} saved={(saved?.notes as Record<string, string> | null) ?? null} />
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-sm font-medium">3 questions for next week</p>
            <AddQuestionsButton questions={suggested} source="weekly" label="Add to my questions list" />
          </div>
          <Link href={`/admin/research/compare?w=${monday}`} className="text-sm text-brand hover:underline">
            Compare with teammate for this week →
          </Link>
        </section>
      </div>
    </>
  );
}
