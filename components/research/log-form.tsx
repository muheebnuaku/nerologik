"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Save, Trash2, X } from "lucide-react";

import { deleteLog, saveLog } from "@/app/admin/(panel)/research/actions";
import { Feedback, ListInput, PrivacyHint, ScorePicker } from "@/components/research/bits";
import { useSave } from "@/components/research/use-save";
import { Button } from "@/components/ui/button";
import { Label, NativeSelect, Textarea } from "@/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import { logEntrySchema, roleOptions, toolOptions, type LogEntry, type TaskItem } from "@/lib/research/config";
import { cn } from "@/lib/utils";

type Props = {
  date: string;
  observer: string;
  initial: LogEntry;
  exists: boolean;
  knownTasks: string[];
  /** Hints from the previous log, used to pre-fill a brand-new entry. */
  previousTools: string[];
  previousSystem: string;
};

const sections = [
  { key: "delays", n: 4, title: "Waiting and delays", hint: "Where did work stop? A signature, a bank response, a printer, a system, a person?", ph: "e.g. Notices waited 2 days for supervisor signature" },
  { key: "repeated", n: 5, title: "Repeated work", hint: "Done twice, retyped, copied between places, or done by hand that could be automated.", ph: "e.g. Bank names retyped from Excel into each letter" },
  { key: "mistakes", n: 6, title: "Mistakes or rework", hint: "Wrong details, lost documents, notices sent again, records that didn't match.", ph: "e.g. 3 notices re-sent with wrong branch address" },
  { key: "questions", n: 7, title: "Questions people kept asking", hint: "e.g. “Has this bank responded?” “How many are still outstanding?”", ph: "e.g. Has this bank responded?" },
  { key: "complaints", n: 8, title: "Complaints I heard", hint: "What staff said was annoying or slow, in their own words.", ph: "e.g. “We spend all morning just stamping copies”" },
] as const;

export function LogForm({ date, observer, initial, exists, knownTasks, previousTools, previousSystem }: Props) {
  const router = useRouter();
  const [e, setE] = useState<LogEntry>(() =>
    exists ? initial : { ...initial, tools: initial.tools.length ? initial.tools : previousTools, systemName: initial.systemName || previousSystem },
  );
  const [dirty, setDirty] = useState(false);
  const { pending, result, run } = useSave();
  const firstRender = useRef(true);

  const set = <K extends keyof LogEntry>(k: K, v: LogEntry[K]) => {
    setE((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  const validation = useMemo(() => logEntrySchema.safeParse(e), [e]);
  const problem = validation.success ? null : validation.error.issues[0];

  // Autosave 2s after the last change (only when valid). Keeps the 5-minute habit frictionless.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!dirty || !validation.success) return;
    const t = setTimeout(() => run(() => saveLog(date, observer, e), (r) => r.ok && setDirty(false)), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const h = (ev: BeforeUnloadEvent) => {
      if (dirty) ev.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        run(() => saveLog(date, observer, e), (r) => r.ok && setDirty(false));
      }}
      className="flex flex-col gap-4"
    >
      <Section n={1} title="Tasks I did today" hint="What, how many items (notices, files, calls), roughly how long.">
        <TaskList value={e.tasksDid} onChange={(v) => set("tasksDid", v)} suggestions={knownTasks} />
      </Section>

      <Section n={2} title="Tasks I saw others do" hint="Same details, plus which role did it.">
        <TaskList value={e.tasksSaw} onChange={(v) => set("tasksSaw", v)} suggestions={knownTasks} withRole />
      </Section>

      <Section n={3} title="Tools used" hint="Tick what came up today.">
        <div className="flex flex-wrap gap-2">
          {toolOptions.map((t) => {
            const on = e.tools.includes(t.value);
            return (
              <button
                key={t.value}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => set("tools", on ? e.tools.filter((x) => x !== t.value) : [...e.tools, t.value])}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  on ? "border-primary bg-brand-soft" : "border-input hover:border-brand/40",
                )}
              >
                {on && <Check className="size-3.5 text-brand" aria-hidden="true" />}
                {t.label}
              </button>
            );
          })}
        </div>
        {(e.tools.includes("gra-system") || e.tools.includes("other")) && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {e.tools.includes("gra-system") && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="systemName">Internal system name (if known)</Label>
                <Input id="systemName" value={e.systemName} onChange={(ev) => set("systemName", ev.target.value)} className="h-10 px-3" />
              </div>
            )}
            {e.tools.includes("other") && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="toolsOther">Other tools</Label>
                <Input id="toolsOther" value={e.toolsOther} onChange={(ev) => set("toolsOther", ev.target.value)} className="h-10 px-3" />
              </div>
            )}
          </div>
        )}
      </Section>

      {sections.map((s) => (
        <Section key={s.key} n={s.n} title={s.title} hint={s.hint}>
          <ListInput id={s.key} value={e[s.key]} onChange={(v) => set(s.key, v)} placeholder={s.ph} />
        </Section>
      ))}

      <Section n={9} title="One thing I learned" hint="A rule, a step, a term, or how a decision gets made.">
        <Textarea value={e.learned} onChange={(ev) => set("learned", ev.target.value)} rows={2} className="min-h-16" aria-label="One thing I learned" />
        <PrivacyHint text={e.learned} />
      </Section>

      <Section n={10} title="Pain score" hint="Today's most painful task, from 1 (minor) to 5 (wastes hours).">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input value={e.painTask} onChange={(ev) => set("painTask", ev.target.value)} placeholder="The most painful task today" className="h-10 flex-1 px-3" aria-label="Most painful task" />
          <ScorePicker label="Pain score" value={e.painScore} onChange={(v) => set("painScore", v)} />
        </div>
        <PrivacyHint text={e.painTask} />
      </Section>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-1 py-3 backdrop-blur">
        <Button type="submit" disabled={pending || !!problem}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Save log
        </Button>
        <span className="text-xs text-muted-foreground">{problem ? problem.message : dirty ? "Unsaved changes, autosaving…" : exists || result?.ok ? "All changes saved" : "Autosaves as you type"}</span>
        <Feedback result={result} />
        {exists && (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-destructive"
            onClick={() => {
              if (confirm("Delete this day's log?")) run(() => deleteLog(date, observer), (r) => r.ok && router.push("/admin/research/log"));
            }}
          >
            <Trash2 /> Delete
          </Button>
        )}
      </div>
    </form>
  );
}

function Section({ n, title, hint, children }: { n: number; title: string; hint: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
      <legend className="sr-only">{title}</legend>
      <div>
        <p className="font-medium">
          <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-brand-soft text-xs text-brand">{n}</span>
          {title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      {children}
    </fieldset>
  );
}

function TaskList({ value, onChange, suggestions, withRole }: { value: TaskItem[]; onChange: (v: TaskItem[]) => void; suggestions: string[]; withRole?: boolean }) {
  const update = (i: number, patch: Partial<TaskItem>) => onChange(value.map((t, k) => (k === i ? { ...t, ...patch } : t)));
  const add = (task = "") => onChange([...value, { task, count: null, minutes: null, ...(withRole ? { role: "Officer" } : {}) }]);
  const num = (v: string) => (v === "" ? null : Math.max(0, Math.min(100000, Math.round(Number(v)) || 0)));
  const unused = suggestions.filter((s) => !value.some((t) => t.task === s)).slice(0, 6);

  return (
    <div className="flex flex-col gap-2">
      {value.map((t, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className={cn("grid gap-2", withRole ? "sm:grid-cols-[minmax(0,1fr)_8rem_5.5rem_5.5rem_auto]" : "sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_auto]")}>
            <Input value={t.task} onChange={(e) => update(i, { task: e.target.value })} placeholder="Task, e.g. Drafted third party notices" className="h-10 px-3" aria-label="Task" />
            {withRole && (
              <NativeSelect value={t.role ?? "Officer"} onChange={(e) => update(i, { role: e.target.value })} aria-label="Role" className="h-10">
                {roleOptions.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </NativeSelect>
            )}
            <Input type="number" inputMode="numeric" min={0} value={t.count ?? ""} onChange={(e) => update(i, { count: num(e.target.value) })} placeholder="Items" className="h-10 px-3" aria-label="How many items" />
            <Input type="number" inputMode="numeric" min={0} value={t.minutes ?? ""} onChange={(e) => update(i, { minutes: num(e.target.value) })} placeholder="Mins" className="h-10 px-3" aria-label="Roughly how many minutes" />
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove task">
              <X />
            </Button>
          </div>
          <PrivacyHint text={t.task} />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={() => add()}>
          <Plus /> Add task
        </Button>
        {unused.map((s) => (
          <button key={s} type="button" onClick={() => add(s)} className="rounded-md border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-brand/40 hover:text-foreground">
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}
