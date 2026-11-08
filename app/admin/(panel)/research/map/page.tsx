import { AlertCircle } from "lucide-react";

import { AddQuestionsButton, NewStep, StepEditor } from "@/components/research/editors";
import { formatDay, gapQuestions, stepEvidence } from "@/lib/research/analysis";
import { getLogs, getSteps } from "@/lib/research/data";

export const metadata = { title: "Process map" };

export default async function MapPage() {
  const [steps, logs] = await Promise.all([getSteps(), getLogs()]);
  const mine = logs.filter((l) => l.observer === "me");
  const evidence = stepEvidence(steps, mine);
  const gapQs = gapQuestions(steps, evidence);
  const complete = evidence.filter((e) => !e.gaps.length).length;

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Third party notice process</h2>
          <p className="text-sm text-muted-foreground">
            {complete} of {steps.length} steps fully mapped. Log entries are linked to steps automatically by their match words. Gaps become questions.
          </p>
        </div>
        <AddQuestionsButton questions={gapQs} source="map" label={`Turn ${gapQs.length} gaps into questions`} />
      </div>

      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => {
          const ev = evidence.find((e) => e.stepId === s.id)!;
          return (
            <li key={s.id} className="grid gap-4 rounded-xl border border-border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <StepEditor key={`${s.id}-${s.position}`} step={s} index={i} total={steps.length} />
                </div>
              </div>
              <aside className="flex flex-col gap-2 border-t border-border pt-3 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
                {ev.gaps.length > 0 && (
                  <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    Missing: {ev.gaps.join(", ")}
                  </p>
                )}
                <p className="text-xs font-medium text-muted-foreground">Seen in your logs ({ev.matches.length})</p>
                {ev.matches.length ? (
                  <ul className="flex flex-col gap-1">
                    {ev.matches.slice(-5).reverse().map((m, k) => (
                      <li key={k} className="text-xs">
                        <span className="text-muted-foreground">{formatDay(m.date)}:</span> {m.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">Nothing yet.</p>
                )}
              </aside>
            </li>
          );
        })}
      </ol>
      <NewStep />
    </>
  );
}
