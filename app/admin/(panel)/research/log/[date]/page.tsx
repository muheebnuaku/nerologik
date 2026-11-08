import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { LogForm } from "@/components/research/log-form";
import { formatDay, isWorkingDay, knownTasks, todayAccra, workingDays } from "@/lib/research/analysis";
import { emptyEntry } from "@/lib/research/config";
import { getLogs } from "@/lib/research/data";

export const metadata = { title: "Log" };

type Props = { params: Promise<{ date: string }>; searchParams: Promise<{ o?: string }> };

export default async function LogDayPage({ params, searchParams }: Props) {
  const { date } = await params;
  const { o } = await searchParams;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) notFound();
  const observer = o?.trim().slice(0, 60) || "me";

  const logs = await getLogs();
  const theirs = logs.filter((l) => l.observer === observer);
  const existing = theirs.find((l) => l.date === date);
  const previous = [...theirs].filter((l) => l.date < date).pop();

  const days = workingDays();
  const i = days.indexOf(date);
  const prev = i > 0 ? days[i - 1] : null;
  const next = i >= 0 && i < days.length - 1 && days[i + 1] <= todayAccra() ? days[i + 1] : null;
  const q = observer === "me" ? "" : `?o=${encodeURIComponent(observer)}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin/research/log" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> All logs
        </Link>
        <div className="flex items-center gap-1">
          {prev && (
            <Link href={`/admin/research/log/${prev}${q}`} className="flex items-center rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
              <ChevronLeft className="size-4" /> {formatDay(prev)}
            </Link>
          )}
          {next && (
            <Link href={`/admin/research/log/${next}${q}`} className="flex items-center rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
              {formatDay(next)} <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">
          {formatDay(date)} {observer !== "me" && <span className="text-muted-foreground">· {observer}&apos;s log</span>}
        </h2>
        <p className="text-sm text-muted-foreground">
          {existing ? "Editing saved log." : previous ? "New log. Tools and system carried over from the last log; quick-add chips are tasks you've logged before." : "New log."}
          {!isWorkingDay(date) && " (Weekend day.)"}
        </p>
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
