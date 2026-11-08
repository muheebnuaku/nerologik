import Link from "next/link";

import { formatDay, isWorkingDay, weekStart } from "@/lib/research/analysis";
import { study } from "@/lib/research/config";
import { cn } from "@/lib/utils";

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const monthShort = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleString("en-GB", { month: "short", timeZone: "UTC" });

type Props = {
  today: string;
  /** Scheduled days (study working days + added dates). */
  scheduled: Set<string>;
  added: Set<string>;
  /** date → pain score (0 if not set) for logged days. */
  logged: Map<string, number>;
};

/** Mon–Sun month grid. Every cell is a large tap target that opens that day's log. */
export function ObservationCalendar({ today, scheduled, added, logged }: Props) {
  const all = [...scheduled, ...logged.keys()].sort();
  const first = weekStart(all[0] ?? study.start);
  const last = all[all.length - 1] ?? study.end;
  const weeks: string[][] = [];
  for (let w = first; w <= last; w = addDays(w, 7)) weeks.push(Array.from({ length: 7 }, (_, i) => addDays(w, i)));

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1 text-center text-[0.6875rem] font-medium text-muted-foreground sm:gap-1.5" aria-hidden="true">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className={cn(i > 4 && "opacity-60")}>
            {d}
          </span>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {weeks.flat().map((d, i) => {
          const pain = logged.get(d);
          const isLogged = pain !== undefined;
          const isScheduled = scheduled.has(d);
          const past = d < today;
          const isToday = d === today;
          const missed = isScheduled && past && !isLogged;
          const quiet = !isScheduled && !isLogged;
          const day = Number(d.slice(8));
          const showMonth = i === 0 || day === 1;
          const state = isLogged ? `logged${pain ? `, pain ${pain} of 5` : ""}` : missed ? "missed" : added.has(d) ? "added, not logged yet" : isScheduled ? "to log" : "not scheduled";

          return (
            <li key={d}>
              <Link
                href={`/research/log/${d}`}
                aria-label={`${formatDay(d)}: ${state}`}
                className={cn(
                  "relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-xl border text-sm transition-[transform,background-color,border-color] active:scale-95 sm:aspect-auto sm:h-16",
                  isLogged && "border-primary/50 bg-primary/15 font-semibold text-foreground",
                  missed && "border-destructive/40 bg-destructive/10 text-destructive",
                  !isLogged && !missed && isScheduled && "border-border bg-card",
                  added.has(d) && !isLogged && !missed && "border-dashed border-primary/60",
                  quiet && "border-transparent text-muted-foreground/50 hover:bg-accent",
                  isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                {showMonth && <span className="absolute top-1 text-[0.5625rem] font-medium uppercase leading-none text-muted-foreground">{monthShort(d)}</span>}
                <span className={cn("tabular-nums", showMonth && "mt-1.5")}>{day}</span>
                {isLogged && (
                  <span className="absolute bottom-1.5 flex gap-0.5" aria-hidden="true">
                    {pain
                      ? Array.from({ length: 5 }, (_, k) => <span key={k} className={cn("size-1 rounded-full", k < pain ? "bg-primary" : "bg-primary/25")} />)
                      : <span className="size-1 rounded-full bg-primary" />}
                  </span>
                )}
                {!isWorkingDay(d) && added.has(d) && !isLogged && <span className="absolute bottom-1.5 size-1 rounded-full bg-primary" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ol>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
        <Legend className="border-primary/50 bg-primary/15">Logged · dots = pain</Legend>
        <Legend className="border-destructive/40 bg-destructive/10">Missed</Legend>
        <Legend className="border-dashed border-primary/60">Added</Legend>
        <Legend className="ring-2 ring-primary">Today</Legend>
      </ul>
    </div>
  );
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn("size-3 rounded border", className)} aria-hidden="true" />
      {children}
    </li>
  );
}
