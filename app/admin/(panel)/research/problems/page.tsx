import { AddCandidate, CandidateCard } from "@/components/research/editors";
import { candidates, draftSummary, effectiveScores, formatDay, total, type Scores, type Summary } from "@/lib/research/analysis";
import { study } from "@/lib/research/config";
import { getCandidateOverrides, getLogs } from "@/lib/research/data";

export const metadata = { title: "Choose problem" };

export default async function ProblemsPage() {
  const [logs, overrides] = await Promise.all([getLogs(), getCandidateOverrides()]);
  const mine = logs.filter((l) => l.observer === "me");
  const byKey = new Map(overrides.map((o) => [o.key, o]));
  const pick = (o?: (typeof overrides)[number]) => ({ frequency: o?.frequency ?? null, pain: o?.pain ?? null, buildable: o?.buildable ?? null, safe: o?.safe ?? null });

  const auto = candidates(logs).map((c) => {
    const o = byKey.get(c.key);
    const scores = effectiveScores(c.auto, pick(o));
    return {
      key: c.key,
      title: o?.title ?? c.title,
      auto: c.auto as Scores | null,
      reasons: c.reasons,
      overrides: pick(o),
      days: c.days.length,
      kinds: c.kinds,
      examples: [...new Set(c.items.map((i) => i.text))],
      dismissed: o?.dismissed ?? false,
      chosen: o?.chosen ?? false,
      savedSummary: (o?.summary as Summary | null) ?? null,
      draftSummary: draftSummary(c, mine, scores),
      total: total(scores),
    };
  });

  const manual = overrides
    .filter((o) => o.key.startsWith("manual:"))
    .map((o) => {
      const scores: Scores = { frequency: o.frequency ?? 1, pain: o.pain ?? 1, buildable: o.buildable ?? 3, safe: o.safe ?? 3 };
      const draft: Summary = {
        problem: o.title,
        affects: "DMCE officers and supervisors.",
        observed: `Added manually. Score: ${total(scores)}/20.`,
        fix: "To be scoped with the supervisor.",
      };
      return {
        key: o.key,
        title: o.title,
        auto: null,
        reasons: undefined,
        overrides: pick(o),
        days: 0,
        kinds: ["manual"],
        examples: [],
        dismissed: o.dismissed,
        chosen: o.chosen,
        savedSummary: (o.summary as Summary | null) ?? null,
        draftSummary: draft,
        total: total(scores),
      };
    });

  const all = [...auto, ...manual].sort((a, b) => Number(b.chosen) - Number(a.chosen) || b.total - a.total || b.days - a.days);
  const active = all.filter((c) => !c.dismissed);
  const dismissed = all.filter((c) => c.dismissed);

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-4 text-sm">
        <p className="font-medium">End of month: {formatDay(study.chooseFrom)} – {formatDay(study.end)}</p>
        <p className="text-muted-foreground">
          Candidates are built automatically from your delays, repeated work, mistakes, questions, complaints and painful tasks, grouped when they describe the same thing.
          Frequency and pain are scored from your logs; buildable and safe are estimates to check. Override any score, choose the top one, and take the one-page summary to your supervisor before building anything.
        </p>
      </div>

      {active.length ? (
        <ol className="flex flex-col gap-3">
          {active.map((c, i) => (
            <CandidateCard
              key={`${c.key}-${c.chosen}`}
              rank={i + 1}
              candKey={c.key}
              title={c.title}
              auto={c.auto}
              overrides={c.overrides}
              reasons={c.reasons}
              days={c.days}
              kinds={c.kinds}
              examples={c.examples}
              chosen={c.chosen}
              savedSummary={c.savedSummary}
              draftSummary={c.draftSummary}
            />
          ))}
        </ol>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No candidates yet. They appear as soon as your logs record delays, repeated work, mistakes or a painful task.
        </p>
      )}

      <AddCandidate />

      {dismissed.length > 0 && (
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer">{dismissed.length} dismissed</summary>
          <ul className="mt-2 flex flex-col gap-1 pl-4">
            {dismissed.map((d) => (
              <li key={d.key}>{d.title}</li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
