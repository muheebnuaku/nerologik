import Link from "next/link";

import { compareObservers, formatDay, studyWeeks, todayAccra, weekEnd, weekStart } from "@/lib/research/analysis";
import { study } from "@/lib/research/config";
import { getLogs } from "@/lib/research/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Teammate" };

type Props = { searchParams: Promise<{ w?: string }> };

export default async function ComparePage({ searchParams }: Props) {
  const { w } = await searchParams;
  const weeks = studyWeeks();
  const range = w && weeks.includes(w) ? { from: w, to: weekEnd(w), label: `Week of ${formatDay(w)}` } : { from: study.start, to: study.end, label: "Whole study" };
  const logs = await getLogs();
  const rows = compareObservers(logs, range.from, range.to).sort((a, b) => (a.observer === "me" ? -1 : b.observer === "me" ? 1 : 0));
  const hasTeammate = rows.some((r) => r.observer !== "me");
  const current = weekStart(todayAccra());

  return (
    <>
      <nav aria-label="Range" className="flex flex-wrap gap-1.5">
        <Link href="/admin/research/compare" className={cn("rounded-lg border px-3 py-1.5 text-sm", !w ? "border-primary bg-brand-soft" : "border-border text-muted-foreground")}>
          Whole study
        </Link>
        {weeks.map((wk, i) => (
          <Link key={wk} href={`/admin/research/compare?w=${wk}`} className={cn("rounded-lg border px-3 py-1.5 text-sm", w === wk ? "border-primary bg-brand-soft" : "border-border text-muted-foreground")}>
            Week {i + 1}
            {wk === current ? " (now)" : ""}
          </Link>
        ))}
      </nav>

      {!hasTeammate ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No teammate logs yet. Ask your colleague to keep the same daily log, then add their entries from{" "}
          <Link href="/admin/research/log" className="text-brand hover:underline">
            Daily log → Teammate logs
          </Link>
          . This page then compares consistency, detail, and what each of you noticed that the other missed.
        </p>
      ) : (
        <>
          <section className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <caption className="px-4 pt-3 text-left font-semibold">{range.label}</caption>
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-normal">Observer</th>
                  <th className="px-4 py-2 text-right font-normal">Days logged</th>
                  <th className="px-4 py-2 text-right font-normal">Consistency</th>
                  <th className="px-4 py-2 text-right font-normal">Words / log</th>
                  <th className="px-4 py-2 text-right font-normal">Notes / log</th>
                  <th className="px-4 py-2 text-right font-normal">Avg pain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.observer}>
                    <td className="px-4 py-2 font-medium">{r.observer === "me" ? "Me" : r.observer}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.days}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.completion}%</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.avgWords}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.avgItems}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.avgPain ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((r) => (
              <section key={r.observer} className="rounded-xl border border-border bg-card p-4">
                <h2 className="mb-2 font-semibold">Only {r.observer === "me" ? "I" : r.observer} noticed</h2>
                {r.uniques.length ? (
                  <ul className="flex flex-col gap-1 text-sm">
                    {r.uniques.map((u) => (
                      <li key={u}>• {u}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nothing unique in this range.</p>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
