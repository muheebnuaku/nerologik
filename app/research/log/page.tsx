import Link from "next/link";
import { Download, PenLine, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDay, todayAccra, workingDays } from "@/lib/research/analysis";
import { getLogs } from "@/lib/research/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Daily log" };

export default async function LogListPage() {
  const logs = await getLogs();
  const today = todayAccra();
  const mine = new Map(logs.filter((l) => l.observer === "me").map((l) => [l.date, l]));
  const teammates = [...new Set(logs.filter((l) => l.observer !== "me").map((l) => l.observer))];
  const extraDays = [...mine.keys()].filter((d) => !workingDays().includes(d));
  const days = [...new Set([...workingDays(), ...extraDays])].sort().reverse();

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link href={`/research/log/${today}`}>
            <PenLine /> {mine.has(today) ? "Edit today's log" : "Write today's log"}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <a href="/research/export" download>
            <Download /> Export my notes
          </a>
        </Button>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <h2 className="border-b border-border px-4 py-3 font-semibold">My logs</h2>
        <ul className="divide-y divide-border">
          {days.map((d) => {
            const l = mine.get(d);
            const e = l?.entry;
            const items = e ? e.tasksDid.length + e.tasksSaw.length + e.delays.length + e.repeated.length + e.mistakes.length + e.questions.length + e.complaints.length : 0;
            const status = l ? "logged" : d < today ? "missed" : d === today ? "today" : "upcoming";
            return (
              <li key={d}>
                <Link href={`/research/log/${d}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent">
                  <span className="w-28 shrink-0 text-sm font-medium">{formatDay(d)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    {e ? e.painTask || e.tasksDid[0]?.task || `${items} notes` : ""}
                  </span>
                  {e?.painScore ? <span className="text-xs tabular-nums text-muted-foreground">pain {e.painScore}/5</span> : null}
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs",
                      status === "logged" && "bg-brand-soft text-brand",
                      status === "missed" && "bg-destructive/10 text-destructive",
                      status === "today" && "bg-primary text-primary-foreground",
                      status === "upcoming" && "text-muted-foreground",
                    )}
                  >
                    {status}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <h2 className="font-semibold">Teammate logs</h2>
          <p className="text-sm text-muted-foreground">Copy in a colleague&apos;s daily log to compare at the Friday review.</p>
        </div>
        {teammates.length > 0 && (
          <ul className="flex flex-col gap-1 text-sm">
            {teammates.map((t) => {
              const theirs = logs.filter((l) => l.observer === t);
              return (
                <li key={t} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{t}</span>
                  <span className="text-muted-foreground">· {theirs.length} logs:</span>
                  {theirs.slice(-6).map((l) => (
                    <Link key={l.date} href={`/research/log/${l.date}?o=${encodeURIComponent(t)}`} className="text-brand hover:underline">
                      {formatDay(l.date)}
                    </Link>
                  ))}
                </li>
              );
            })}
          </ul>
        )}
        <form action="/research/log/go" className="flex flex-wrap items-end gap-2">
          <Input name="o" required maxLength={60} placeholder="Teammate's first name" className="h-10 w-48 px-3" aria-label="Teammate" />
          <Input name="d" type="date" required defaultValue={today} className="h-10 w-44 px-3" aria-label="Date" />
          <Button type="submit" variant="outline">
            <UserPlus /> Add their log
          </Button>
        </form>
      </section>
    </>
  );
}
