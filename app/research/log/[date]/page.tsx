import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { LogForm } from "@/components/research/log-form";
import { formatDay, isWorkingDay, knownTasks, todayAccra, workingDays } from "@/lib/research/analysis";
import { emptyEntry } from "@/lib/research/config";
import { RemoveCalendarDay } from "@/components/research/editors";
import { getCustomDays, getLogs } from "@/lib/research/data";

export const metadata = { title: "Log" };

type Props = { params: Promise<{ date: string }>; searchParams: Promise<{ o?: string }> };

export default async function LogDayPage({ params, searchParams }: Props) {
  const { date } = await params;
  const { o } = await searchParams;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) notFound();
  const observer = o?.trim().slice(0, 60) || "me";

  const [logs, customDays] = await Promise.all([getLogs(), getCustomDays()]);
  const theirs = logs.filter((l) => l.observer === observer);
  const existing = theirs.find((l) => l.date === date);
  const previous = [...theirs].filter((l) => l.date < date).pop();

  // Step through every scheduled or logged day, including dates added to the calendar.
  const days = [...new Set([...workingDays(), ...customDays, ...theirs.map((l) => l.date), date])].sort();
  const i = days.indexOf(date);
  const prev = i > 0 ? days[i - 1] : null;
  const next = i < days.length - 1 && days[i + 1] <= todayAccra() ? days[i + 1] : null;
  const isAdded = observer === "me" && customDays.includes(date) && !existing;
  const q = observer === "me" ? "" : `?o=${encodeURIComponent(observer)}`;

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Link href="/research/log" className="-ml-2 flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> All logs
        </Link>
        {isAdded && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Added day <RemoveCalendarDay date={date} />
          </span>
        )}
      </div>

      {/* Day switcher */}
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5">
        {prev ? (
          <Link href={`/research/log/${prev}${q}`} aria-label={`Previous day, ${formatDay(prev)}`} className="flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-accent">
            <ChevronLeft className="size-5" />
          </Link>
        ) : (
          <span className="size-11 shrink-0" />
        )}
        <div className="min-w-0 flex-1 text-center">
          <h2 className="truncate font-display text-lg font-semibold sm:text-xl">
            {formatDay(date)}
            {observer !== "me" && <span className="text-muted-foreground"> · {observer}</span>}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {existing ? "Saved · edits autosave" : previous ? "New log · tools carried over" : "New log"}
            {!isWorkingDay(date) && " · weekend"}
          </p>
        </div>
        {next ? (
          <Link href={`/research/log/${next}${q}`} aria-label={`Next day, ${formatDay(next)}`} className="flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-accent">
            <ChevronRight className="size-5" />
          </Link>
        ) : (
          <span className="size-11 shrink-0" />
        )}
      </div>

      <LogForm
        key={`${date}-${observer}`}
        date={date}
        observer={observer}
        initial={existing?.entry ?? emptyEntry()}
        exists={!!existing}
        knownTasks={knownTasks(theirs)}
        previousTools={previous?.entry.tools ?? []}
        previousSystem={previous?.entry.systemName ?? ""}
      />
    </>
  );
}
