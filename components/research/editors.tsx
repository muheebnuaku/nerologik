"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, ClipboardCopy, Loader2, Plus, Printer, RotateCcw, Save, Star, Trash2, X } from "lucide-react";

import {
  addManualCandidate,
  addQuestions,
  deleteQuestion,
  deleteStep,
  moveStep,
  saveCandidate,
  saveStep,
  saveWeekly,
  updateQuestion,
} from "@/app/admin/(panel)/research/actions";
import { Feedback, PrivacyHint, ScorePicker } from "@/components/research/bits";
import { useSave } from "@/components/research/use-save";
import { Button } from "@/components/ui/button";
import { Label, NativeSelect, Textarea } from "@/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import type { Scores, Summary } from "@/lib/research/analysis";
import { weeklyPrompts } from "@/lib/research/config";
import { cn } from "@/lib/utils";

/* ───────────── Weekly review ───────────── */

export function WeeklyEditor({ weekStart, draft, saved }: { weekStart: string; draft: Record<string, string>; saved: Record<string, string> | null }) {
  const [notes, setNotes] = useState<Record<string, string>>(() => ({ ...draft, ...(saved ?? {}) }));
  const { pending, result, run } = useSave();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveWeekly(weekStart, notes));
      }}
      className="flex flex-col gap-4"
    >
      {weeklyPrompts.map((p) => (
        <div key={p.key} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={p.key}>{p.label}</Label>
            {saved?.[p.key] !== undefined && notes[p.key] !== draft[p.key] && (
              <button type="button" onClick={() => setNotes((n) => ({ ...n, [p.key]: draft[p.key] }))} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <RotateCcw className="size-3" /> Use fresh draft
              </button>
            )}
          </div>
          <Textarea id={p.key} rows={4} className="min-h-24" value={notes[p.key] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [p.key]: e.target.value }))} />
          <PrivacyHint text={notes[p.key] ?? ""} />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Save review
        </Button>
        <Feedback result={result} />
        {!saved && <span className="text-xs text-muted-foreground">Auto-drafted from this week&apos;s logs. Edit, then save.</span>}
      </div>
    </form>
  );
}

/** Adds a set of generated questions to the questions list. */
export function AddQuestionsButton({ questions, source, label }: { questions: string[]; source: "weekly" | "map"; label: string }) {
  const { pending, result, run } = useSave();
  if (!questions.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => run(() => addQuestions(questions, source))} className="self-start">
        {pending ? <Loader2 className="animate-spin" /> : <Plus />} {label}
      </Button>
      <Feedback result={result} />
    </div>
  );
}

/* ───────────── Process map ───────────── */

type Step = { id: string; title: string; tool: string | null; owner: string | null; notes: string | null; keywords: string[] };

export function StepEditor({ step, index, total, onDone }: { step: Step | null; index?: number; total?: number; onDone?: () => void }) {
  const [v, setV] = useState({
    title: step?.title ?? "",
    tool: step?.tool ?? "",
    owner: step?.owner ?? "",
    notes: step?.notes ?? "",
    keywords: (step?.keywords ?? []).join(", "),
  });
  const { pending, result, run } = useSave();
  const field = (k: keyof typeof v) => ({ value: v[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((s) => ({ ...s, [k]: e.target.value })) });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () => saveStep(step?.id ?? null, { ...v, keywords: v.keywords.split(",").map((k) => k.trim()).filter((k) => k.length >= 2) }),
          (r) => r.ok && onDone?.(),
        );
      }}
      className="flex flex-col gap-3"
    >
      <Input aria-label="Step" placeholder="How …" className="h-10 px-3 font-medium" {...field("title")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Tool used</Label>
          <Input placeholder="e.g. Excel, printed letter" className="h-9 px-3" {...field("tool")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Person responsible</Label>
          <Input placeholder="Role, e.g. Supervisor" className="h-9 px-3" {...field("owner")} />
        </div>
      </div>
      <Textarea aria-label="Notes" placeholder="What happens in this step" rows={2} className="min-h-16" {...field("notes")} />
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Match words (link log entries to this step)</Label>
        <Input className="h-9 px-3 text-xs" {...field("keywords")} />
      </div>
      <PrivacyHint text={`${v.title} ${v.tool} ${v.owner} ${v.notes}`} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={pending || !v.title.trim()}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} {step ? "Save step" : "Add step"}
        </Button>
        {step && index !== undefined && total !== undefined && (
          <>
            <Button type="button" size="icon" variant="ghost" disabled={index === 0 || pending} onClick={() => run(() => moveStep(step.id, -1))} aria-label="Move up">
              <ArrowUp />
            </Button>
            <Button type="button" size="icon" variant="ghost" disabled={index === total - 1 || pending} onClick={() => run(() => moveStep(step.id, 1))} aria-label="Move down">
              <ArrowDown />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => confirm("Remove this step?") && run(() => deleteStep(step.id))} aria-label="Remove step">
              <Trash2 />
            </Button>
          </>
        )}
        <Feedback result={result} />
      </div>
    </form>
  );
}

export function NewStep() {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <Button variant="outline" onClick={() => setOpen(true)} className="self-start">
        <Plus /> Add step
      </Button>
    );
  return (
    <div className="rounded-xl border border-dashed border-border p-4">
      <StepEditor step={null} onDone={() => setOpen(false)} />
    </div>
  );
}

/* ───────────── Questions ───────────── */

type Question = { id: string; question: string; source: string; status: "open" | "asked" | "answered"; answer: string | null };

export function QuestionRow({ q }: { q: Question }) {
  const [status, setStatus] = useState(q.status);
  const [answer, setAnswer] = useState(q.answer ?? "");
  const [open, setOpen] = useState(false);
  const { pending, result, run } = useSave();
  const changed = status !== q.status || answer !== (q.answer ?? "");

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => run(() => updateQuestion(q.id, q.status === "answered" ? "open" : "answered", answer))}
          aria-label={q.status === "answered" ? "Mark as open" : "Mark as answered"}
          className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border", q.status === "answered" ? "border-primary bg-primary text-primary-foreground" : "border-input")}
        >
          {q.status === "answered" && <Check className="size-3.5" />}
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex-1 text-left">
          <span className={cn("text-sm", q.status === "answered" && "text-muted-foreground line-through")}>{q.question}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {q.source !== "manual" && `${q.source} · `}
            {q.status}
          </span>
          {q.answer && !open && <span className="mt-0.5 block text-xs text-muted-foreground">↳ {q.answer}</span>}
        </button>
        <button type="button" onClick={() => confirm("Remove this question?") && run(() => deleteQuestion(q.id))} aria-label="Remove question" className="text-muted-foreground hover:text-destructive">
          <X className="size-4" />
        </button>
      </div>
      {open && (
        <div className="ml-8 flex flex-col gap-2">
          <Textarea rows={2} className="min-h-16" placeholder="What did you learn?" value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label="Answer" />
          <PrivacyHint text={answer} />
          <div className="flex flex-wrap items-center gap-2">
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value as Question["status"])} aria-label="Status" className="h-9 w-36">
              <option value="open">Open</option>
              <option value="asked">Asked</option>
              <option value="answered">Answered</option>
            </NativeSelect>
            <Button size="sm" disabled={!changed || pending} onClick={() => run(() => updateQuestion(q.id, status, answer))}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />} Save
            </Button>
            <Feedback result={result} />
          </div>
        </div>
      )}
      {!open && <Feedback result={result} />}
    </li>
  );
}

export function AddQuestion() {
  const [q, setQ] = useState("");
  const { pending, result, run } = useSave();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => addQuestions([q]), (r) => r.ok && setQ(""));
      }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add a question to ask staff" className="h-10 px-3" />
        <Button type="submit" disabled={pending || q.trim().length < 3}>
          <Plus /> Add
        </Button>
      </div>
      <PrivacyHint text={q} />
      <Feedback result={result} />
    </form>
  );
}

/* ───────────── Candidate problems ───────────── */

type CandidateProps = {
  rank: number;
  candKey: string;
  title: string;
  auto: Scores | null;
  overrides: Partial<Record<keyof Scores, number | null>>;
  reasons?: Partial<Record<keyof Scores, string>>;
  days: number;
  kinds: string[];
  examples: string[];
  chosen: boolean;
  savedSummary: Summary | null;
  draftSummary: Summary;
};

const criteria: { key: keyof Scores; label: string; hint: string }[] = [
  { key: "frequency", label: "Frequency", hint: "How often it happens" },
  { key: "pain", label: "Pain", hint: "Time or frustration caused" },
  { key: "buildable", label: "Buildable", hint: "Small team, a few weeks" },
  { key: "safe", label: "Safe", hint: "No risky taxpayer-data access" },
];

export function CandidateCard(p: CandidateProps) {
  const [o, setO] = useState(p.overrides);
  const [open, setOpen] = useState(p.chosen);
  const [summary, setSummary] = useState<Summary>(p.savedSummary ?? p.draftSummary);
  const { pending, result, run } = useSave();
  const score = (k: keyof Scores) => o[k] ?? p.auto?.[k] ?? 3;
  const total = criteria.reduce((a, c) => a + score(c.key), 0);

  const save = (extra: { dismissed?: boolean; chosen?: boolean } = {}) =>
    run(() =>
      saveCandidate({
        key: p.candKey,
        title: p.title,
        frequency: o.frequency ?? null,
        pain: o.pain ?? null,
        buildable: o.buildable ?? null,
        safe: o.safe ?? null,
        dismissed: extra.dismissed ?? false,
        chosen: extra.chosen ?? p.chosen,
        summary: open || p.chosen || extra.chosen ? summary : null,
      }),
    );

  const text = `PROBLEM\n${summary.problem}\n\nWHO IT AFFECTS\n${summary.affects}\n\nWHAT I OBSERVED\n${summary.observed}\n\nPROPOSED FIX\n${summary.fix}`;

  return (
    <li className={cn("flex flex-col gap-3 rounded-xl border bg-card p-4", p.chosen ? "border-2 border-primary" : "border-border")}>
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold tabular-nums">{p.rank}</span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {p.title} {p.chosen && <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-[0.6875rem] font-semibold text-primary-foreground">CHOSEN</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            {p.days ? `${p.days} day${p.days === 1 ? "" : "s"} · ` : "Added manually · "}
            {p.kinds.join(", ")}
          </p>
          {p.examples.length > 1 && <p className="mt-1 truncate text-xs text-muted-foreground">Also: {p.examples.slice(1, 4).join(" · ")}</p>}
        </div>
        <span className="font-display text-2xl font-semibold tabular-nums">
          {total}
          <span className="text-sm font-normal text-muted-foreground">/20</span>
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {criteria.map((c) => (
          <div key={c.key} className="flex flex-col gap-1">
            <p className="text-xs font-medium">
              {c.label} <span className="font-normal text-muted-foreground">· {o[c.key] != null ? "you" : p.auto ? "auto" : "default"}</span>
            </p>
            <ScorePicker label={c.label} value={score(c.key)} onChange={(v) => setO((s) => ({ ...s, [c.key]: v }))} />
            <p className="text-[0.6875rem] text-muted-foreground" title={p.reasons?.[c.key]}>
              {p.reasons?.[c.key] ?? c.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => save()}>
          <Save /> Save scores
        </Button>
        <Button size="sm" variant={p.chosen ? "secondary" : "default"} disabled={pending} onClick={() => { setOpen(true); save({ chosen: !p.chosen }); }}>
          <Star /> {p.chosen ? "Unchoose" : "Choose this problem"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen((x) => !x)}>
          {open ? "Hide summary" : "One-page summary"}
        </Button>
        <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" disabled={pending} onClick={() => save({ dismissed: true })}>
          <X /> Dismiss
        </Button>
        <Feedback result={result} />
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-border pt-3" data-summary>
          {(
            [
              ["problem", "The problem"],
              ["affects", "Who it affects"],
              ["observed", "What I observed"],
              ["fix", "The fix I would propose"],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="flex flex-col gap-1.5">
              <Label htmlFor={`${p.candKey}-${k}`}>{label}</Label>
              <Textarea id={`${p.candKey}-${k}`} rows={3} className="min-h-20" value={summary[k]} onChange={(e) => setSummary((s) => ({ ...s, [k]: e.target.value }))} />
            </div>
          ))}
          <PrivacyHint text={text} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={pending} onClick={() => save()}>
              <Save /> Save summary
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSummary(p.draftSummary)}>
              <RotateCcw /> Re-draft from logs
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(text)}>
              <ClipboardCopy /> Copy
            </Button>
            <Button size="sm" variant="outline" onClick={() => printSummary(p.title, summary)}>
              <Printer /> Print / PDF
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function printSummary(title: string, s: Summary) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const block = (h: string, t: string) => `<h2>${h}</h2><p>${esc(t).replace(/\n/g, "<br>")}</p>`;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font:14px/1.6 Inter,Segoe UI,Arial,sans-serif;max-width:680px;margin:40px auto;color:#111;padding:0 24px}h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#15803d;margin:22px 0 6px}.m{color:#555;font-size:12px}</style></head>
<body><h1>${esc(title)}</h1><p class="m">DMCE observation, November 2026 · One-page summary for supervisor approval</p>
${block("The problem", s.problem)}${block("Who it affects", s.affects)}${block("What I observed", s.observed)}${block("The fix I would propose", s.fix)}
<script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}

export function AddCandidate() {
  const [t, setT] = useState("");
  const { pending, result, run } = useSave();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => addManualCandidate(t), (r) => r.ok && setT(""));
      }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex gap-2">
        <Input value={t} onChange={(e) => setT(e.target.value)} placeholder="Add a problem the logs missed" className="h-10 px-3" />
        <Button type="submit" variant="outline" disabled={pending || t.trim().length < 3}>
          <Plus /> Add
        </Button>
      </div>
      <PrivacyHint text={t} />
      <Feedback result={result} />
    </form>
  );
}
