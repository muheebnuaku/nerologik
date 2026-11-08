/**
 * Deterministic analysis of the observation logs. No AI, no network: the
 * study rules forbid sending anything observed at GRA to AI tools.
 */
import { study, toolOptions, type LogEntry, type WeeklyKey } from "./config";

export type LogRecord = { date: string; observer: string; entry: LogEntry };
export type StepRecord = { id: string; title: string; tool: string | null; owner: string | null; keywords: string[] };

/* ───────────────────────── Dates (Africa/Accra = UTC) ───────────────────────── */

export const todayAccra = () => new Date().toISOString().slice(0, 10);

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const weekday = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 Sun … 6 Sat
export const isWorkingDay = (iso: string) => weekday(iso) >= 1 && weekday(iso) <= 5;

export function workingDays(start = study.start, end = study.end): string[] {
  const days: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) if (isWorkingDay(d)) days.push(d);
  return days;
}

/** Monday of the week containing `iso`. */
export function weekStart(iso: string): string {
  const wd = weekday(iso);
  return addDays(iso, wd === 0 ? -6 : 1 - wd);
}

export const weekEnd = (monday: string) => addDays(monday, 4);

export function studyWeeks(): string[] {
  return [...new Set(workingDays().map(weekStart))];
}

const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
export const formatDay = (iso: string) => dayFmt.format(new Date(`${iso}T00:00:00Z`));

/* ───────────────────────── Text similarity ───────────────────────── */

const stop = new Set(
  "a an the and or but of to in on at for from by with without is are was were be been being it its this that these those i we they he she you my our their his her them us me as so if then than too very just also not no yes do did does done have has had can could would should will shall may might must there here what which who whom when where why how all any each every some more most many much few one two three about into over under again out up down off still yet only own same such get got make made".split(" "),
);

/** Crude stemmer: strip common endings, then keep a 5-letter root so
 *  "response", "responses", "responded" and "responding" all match. */
function stem(w: string): string {
  const base = w.replace(/(ing|ed|es|s)$/, "");
  return (base.length >= 3 ? base : w).slice(0, 5);
}

export function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stop.has(w))
      .map(stem),
  );
}

export function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const jaccard = inter / (a.size + b.size - inter);
  const overlap = inter / Math.min(a.size, b.size); // short phrase contained in a longer one
  return Math.max(jaccard, overlap * 0.75);
}

const SIMILAR = 0.45;

export type ItemKind = "task" | "seen" | "delay" | "repeated" | "mistake" | "question" | "complaint" | "pain";

export type Item = {
  text: string;
  kind: ItemKind;
  date: string;
  observer: string;
  count?: number | null;
  minutes?: number | null;
  role?: string;
  pain?: number | null;
};

export type Cluster = {
  key: string;
  label: string;
  items: Item[];
  days: string[];
  kinds: ItemKind[];
};

export function itemsOf(logs: LogRecord[], kinds?: ItemKind[]): Item[] {
  const out: Item[] = [];
  for (const { date, observer, entry: e } of logs) {
    const push = (kind: ItemKind, text: string, extra: Partial<Item> = {}) => {
      if (text.trim() && (!kinds || kinds.includes(kind))) out.push({ text: text.trim(), kind, date, observer, pain: e.painScore, ...extra });
    };
    e.tasksDid.forEach((t) => push("task", t.task, { count: t.count, minutes: t.minutes, role: "Me" }));
    e.tasksSaw.forEach((t) => push("seen", t.task, { count: t.count, minutes: t.minutes, role: t.role }));
    e.delays.forEach((t) => push("delay", t));
    e.repeated.forEach((t) => push("repeated", t));
    e.mistakes.forEach((t) => push("mistake", t));
    e.questions.forEach((t) => push("question", t));
    e.complaints.forEach((t) => push("complaint", t));
    if (e.painTask) push("pain", e.painTask);
  }
  return out;
}

/** Greedy single-pass clustering by token overlap. Stable for the same input. */
export function cluster(items: Item[]): Cluster[] {
  const groups: { toks: Set<string>; items: Item[] }[] = [];
  for (const it of items) {
    const t = tokens(it.text);
    let best: (typeof groups)[number] | null = null;
    let bestScore = 0;
    for (const g of groups) {
      const s = similarity(t, g.toks);
      if (s > bestScore) {
        bestScore = s;
        best = g;
      }
    }
    if (best && bestScore >= SIMILAR) {
      best.items.push(it);
      for (const x of t) best.toks.add(x);
    } else groups.push({ toks: t, items: [it] });
  }

  return groups.map((g) => {
    // Label: the shortest phrasing among the most frequent texts.
    const freq = new Map<string, number>();
    for (const it of g.items) freq.set(it.text, (freq.get(it.text) ?? 0) + 1);
    const label = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0][0];
    const key = [...g.toks].sort().slice(0, 6).join("-") || label.toLowerCase().slice(0, 40);
    return {
      key,
      label,
      items: g.items,
      days: [...new Set(g.items.map((i) => i.date))].sort(),
      kinds: [...new Set(g.items.map((i) => i.kind))],
    };
  });
}

/* ───────────────────────── Weekly stats ───────────────────────── */

export type WeeklyStats = {
  weekStart: string;
  workingDays: string[];
  loggedDays: string[];
  missingDays: string[];
  avgPain: number | null;
  topTasks: { label: string; mentions: number; items: number; minutes: number; roles: string[] }[];
  painTasks: { label: string; score: number; date: string }[];
  tools: { label: string; days: number }[];
  systems: string[];
  roles: { role: string; tasks: string[] }[];
  themes: { kind: ItemKind; clusters: Cluster[] }[];
  learned: { date: string; text: string }[];
};

const toolLabel = (v: string) => toolOptions.find((t) => t.value === v)?.label ?? v;

export function weeklyStats(allLogs: LogRecord[], monday: string, observer = "me"): WeeklyStats {
  const days = workingDays(monday, weekEnd(monday));
  const logs = allLogs.filter((l) => l.observer === observer && l.date >= monday && l.date <= weekEnd(monday));
  const logged = logs.map((l) => l.date);
  const pains = logs.map((l) => l.entry.painScore).filter((p): p is number => p != null);

  const taskClusters = cluster(itemsOf(logs, ["task", "seen"])).sort((a, b) => b.days.length - a.days.length || b.items.length - a.items.length);

  const toolDays = new Map<string, number>();
  for (const l of logs) for (const t of new Set(l.entry.tools)) toolDays.set(t, (toolDays.get(t) ?? 0) + 1);

  const roleMap = new Map<string, Set<string>>();
  for (const c of taskClusters)
    for (const it of c.items) {
      const r = it.role || "Unknown";
      if (!roleMap.has(r)) roleMap.set(r, new Set());
      roleMap.get(r)!.add(c.label);
    }

  const themeKinds: ItemKind[] = ["delay", "repeated", "mistake", "question", "complaint"];

  return {
    weekStart: monday,
    workingDays: days,
    loggedDays: logged,
    missingDays: days.filter((d) => !logged.includes(d) && d <= todayAccra()),
    avgPain: pains.length ? Math.round((pains.reduce((a, b) => a + b, 0) / pains.length) * 10) / 10 : null,
    topTasks: taskClusters.slice(0, 6).map((c) => ({
      label: c.label,
      mentions: c.days.length,
      items: c.items.reduce((a, i) => a + (i.count ?? 0), 0),
      minutes: c.items.reduce((a, i) => a + (i.minutes ?? 0), 0),
      roles: [...new Set(c.items.map((i) => i.role || "Unknown"))],
    })),
    painTasks: logs
      .filter((l) => l.entry.painTask && l.entry.painScore)
      .map((l) => ({ label: l.entry.painTask, score: l.entry.painScore!, date: l.date }))
      .sort((a, b) => b.score - a.score),
    tools: [...toolDays.entries()].map(([t, n]) => ({ label: toolLabel(t), days: n })).sort((a, b) => b.days - a.days),
    systems: [...new Set(logs.map((l) => l.entry.systemName).filter(Boolean))],
    roles: [...roleMap.entries()].map(([role, t]) => ({ role, tasks: [...t].slice(0, 6) })),
    themes: themeKinds.map((kind) => ({
      kind,
      clusters: cluster(itemsOf(logs, [kind])).sort((a, b) => b.items.length - a.items.length),
    })),
    learned: logs.filter((l) => l.entry.learned).map((l) => ({ date: l.date, text: l.entry.learned })),
  };
}

/* ───────────────────────── Process map ───────────────────────── */

export type StepEvidence = { stepId: string; matches: Item[]; gaps: string[] };

export function stepEvidence(steps: StepRecord[], logs: LogRecord[]): StepEvidence[] {
  const items = itemsOf(logs);
  return steps.map((s) => {
    const kw = new Set([...s.keywords, ...tokens(s.title)].map((k) => stem(k.toLowerCase())));
    const matches = items.filter((it) => [...tokens(it.text)].some((t) => kw.has(t)));
    const gaps: string[] = [];
    if (!s.tool) gaps.push("tool");
    if (!s.owner) gaps.push("owner");
    if (!matches.length) gaps.push("observations");
    return { stepId: s.id, matches, gaps };
  });
}

export function gapQuestions(steps: StepRecord[], evidence: StepEvidence[]): string[] {
  const out: string[] = [];
  for (const s of steps) {
    const ev = evidence.find((e) => e.stepId === s.id);
    const title = s.title.replace(/^how\s+/i, "").replace(/\.$/, "");
    if (!s.owner) out.push(`Who is responsible for this step: ${title.toLowerCase()}?`);
    if (!s.tool) out.push(`What tool or form is used when ${title.toLowerCase()}?`);
    if (ev && !ev.matches.length) out.push(`Can I watch or be walked through how ${title.toLowerCase()}?`);
  }
  return out;
}

/* ───────────────────────── Weekly draft ───────────────────────── */

export function draftWeekly(stats: WeeklyStats, gapQs: string[], openQs: string[]): Record<WeeklyKey, string> {
  const top = stats.topTasks.slice(0, 3);
  const pain = stats.painTasks.slice(0, 3);
  const unknowns = [...stats.themes.find((t) => t.kind === "question")!.clusters.map((c) => `People keep asking: “${c.label}” — how is this answered today?`), ...gapQs, ...openQs].slice(0, 3);

  return {
    topTasks: top.length
      ? top
          .map((t) => `${t.label} — on ${t.mentions} of ${stats.loggedDays.length} logged days${t.items ? `, ~${t.items} items` : ""}${t.minutes ? `, ~${Math.round(t.minutes / 60 * 10) / 10}h` : ""}.`)
          .join("\n")
      : "No tasks logged yet this week.",
    painTasks: pain.length
      ? pain.map((p) => `${p.label} — ${p.score}/5 (${formatDay(p.date)}).`).join("\n") + (stats.avgPain ? `\nAverage pain this week: ${stats.avgPain}/5.` : "")
      : "No pain scores recorded yet.",
    tools: stats.tools.length
      ? stats.tools.map((t) => `${t.label} (${t.days} day${t.days === 1 ? "" : "s"})`).join(", ") + "." + (stats.systems.length ? `\nSystems named: ${stats.systems.join(", ")}.` : "")
      : "No tools recorded yet.",
    people: stats.roles.length ? stats.roles.map((r) => `${r.role}: ${r.tasks.join("; ")}`).join("\n") : "No roles recorded yet.",
    unknowns: unknowns.length ? unknowns.map((q, i) => `${i + 1}. ${q}`).join("\n") : "1. \n2. \n3. ",
  };
}

/* ───────────────────────── Candidate problems ───────────────────────── */

export type Scores = { frequency: number; pain: number; buildable: number; safe: number };
export type Candidate = Cluster & { title: string; auto: Scores; reasons: Record<keyof Scores, string> };

/** Best phrasing of a problem: the painful task, then the delay/repeat, then the label. */
function problemTitle(c: Cluster): string {
  const pick = (...kinds: ItemKind[]) => c.items.find((i) => kinds.includes(i.kind))?.text;
  return (pick("pain") ?? pick("repeated", "delay", "mistake") ?? c.label).replace(/[.?!]+$/, "");
}

const buildableWords = ["excel", "spreadsheet", "sheet", "track", "status", "list", "retype", "copy", "template", "report", "letter", "notice", "reminder", "follow", "count", "register", "print", "type", "manual", "search", "find"];
const hardWords = ["system", "integration", "access", "legal", "law", "policy", "approval", "budget", "network", "server"];
const riskyWords = ["tin", "account", "taxpayer", "detail", "personal", "identity", "statement", "balance", "amount", "owed", "bank detail", "debtor detail"];
const safeWords = ["template", "reminder", "checklist", "count", "schedule", "queue", "register", "status", "print"];

const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)));
const has = (toks: Set<string>, words: string[]) => words.filter((w) => toks.has(stem(w))).length;

export function candidates(logs: LogRecord[], observer = "me"): Candidate[] {
  const mine = logs.filter((l) => l.observer === observer);
  const loggedDays = Math.max(1, mine.length);
  const clusters = cluster(itemsOf(mine, ["delay", "repeated", "mistake", "question", "complaint", "pain"]));

  return clusters
    .map((c) => {
      const toks = new Set(c.items.flatMap((i) => [...tokens(i.text)]));
      const ratio = c.days.length / loggedDays;
      const frequency = clamp(c.days.length >= 8 || ratio >= 0.6 ? 5 : c.days.length >= 5 || ratio >= 0.4 ? 4 : c.days.length >= 3 ? 3 : c.days.length === 2 ? 2 : 1);

      const explicit = c.items.filter((i) => i.kind === "pain" && i.pain).map((i) => i.pain!);
      const dayPains = c.items.map((i) => i.pain).filter((p): p is number => p != null);
      const pain = explicit.length ? clamp(Math.max(...explicit)) : dayPains.length ? clamp(dayPains.reduce((a, b) => a + b, 0) / dayPains.length) : 2;

      const b = 3 + Math.min(2, has(toks, buildableWords)) * 0.75 + (c.kinds.includes("repeated") ? 0.5 : 0) - Math.min(2, has(toks, hardWords));
      const s = 4 - Math.min(3, has(toks, riskyWords)) + Math.min(1, has(toks, safeWords)) * 0.5 - (toks.has("system") ? 1 : 0);

      return {
        ...c,
        title: problemTitle(c),
        auto: { frequency, pain, buildable: clamp(b), safe: clamp(s) },
        reasons: {
          frequency: `Seen on ${c.days.length} of ${loggedDays} logged day${loggedDays === 1 ? "" : "s"}.`,
          pain: explicit.length ? `Marked as the day's most painful task (${Math.max(...explicit)}/5).` : dayPains.length ? `Average pain on those days.` : "No pain score linked; default.",
          buildable: "Estimated from the words used (manual, retyping, tracking vs system access, policy).",
          safe: "Estimated from mentions of taxpayer data, accounts or system access.",
        },
      };
    })
    .sort((x, y) => total(y.auto) - total(x.auto) || y.days.length - x.days.length);
}

export const total = (s: Scores) => s.frequency + s.pain + s.buildable + s.safe;

export function effectiveScores(auto: Scores, o: Partial<Record<keyof Scores, number | null>>): Scores {
  return {
    frequency: o.frequency ?? auto.frequency,
    pain: o.pain ?? auto.pain,
    buildable: o.buildable ?? auto.buildable,
    safe: o.safe ?? auto.safe,
  };
}

/* ───────────────────────── One-page summary ───────────────────────── */

export type Summary = { problem: string; affects: string; observed: string; fix: string };

const fixes: { words: string[]; fix: string }[] = [
  { words: ["respond", "response", "track", "status", "follow", "outstanding", "chase"], fix: "A simple tracker for each batch of notices: stage, date sent, bank responded yes/no, with automatic follow-up reminders and a live count of what is outstanding. Counts and stages only, no taxpayer details." },
  { words: ["retype", "copy", "duplicate", "again", "manual", "type", "template"], fix: "A notice/letter template generator that fills documents from one prepared list, so nothing is typed twice. Runs offline on the unit's own machine." },
  { words: ["signature", "sign", "approve", "approval", "wait", "supervisor"], fix: "An approval queue showing what is waiting for whom and since when, with a daily summary for the supervisor." },
  { words: ["file", "find", "lost", "where", "search", "folder", "copy"], fix: "A filing register/index (batch, date, box/shelf location) so stamped copies and files can be found in seconds." },
  { words: ["report", "progress", "count", "many", "summary"], fix: "An automatic weekly progress report generated from the batch tracker, replacing manual counting." },
  { words: ["print", "printer", "paper"], fix: "A print-batching checklist and schedule so notices are prepared and printed in one run instead of piecemeal." },
];

export function draftSummary(c: Candidate, logs: LogRecord[], scores: Scores): Summary {
  const toks = new Set(c.items.flatMap((i) => [...tokens(i.text)]));
  const fix = fixes.map((f) => ({ f, n: has(toks, f.words) })).sort((a, b) => b.n - a.n)[0];
  const roles = [...new Set(itemsOf(logs.filter((l) => c.days.includes(l.date)), ["seen"]).map((i) => i.role).filter(Boolean))];
  const quotes = c.items.filter((i) => i.kind === "complaint" || i.kind === "question").slice(0, 2).map((i) => `“${i.text}”`);
  const kindsText = c.kinds
    .map((k) => ({ delay: "a delay", repeated: "repeated work", mistake: "rework/mistakes", question: "a question staff kept asking", complaint: "a staff complaint", pain: "the day's most painful task", task: "a task", seen: "a task" })[k])
    .join(", ");

  return {
    problem: `${c.title}. It came up as ${kindsText}${c.items.length > 1 ? `, ${c.items.length} times in total` : ""}.`,
    affects: `DMCE ${roles.length ? roles.join(", ") : "officers"} handling third party notices${roles.includes("Supervisor") ? "" : ", and supervisors who need progress updates"}.`,
    observed: `Recorded on ${c.days.length} working day${c.days.length === 1 ? "" : "s"} between ${formatDay(c.days[0])} and ${formatDay(c.days[c.days.length - 1])}. Score: frequency ${scores.frequency}, pain ${scores.pain}, buildable ${scores.buildable}, safe ${scores.safe} (total ${total(scores)}/20).${quotes.length ? ` Staff said: ${quotes.join(" ")}` : ""}`,
    fix: fix && fix.n > 0 ? fix.f.fix : "A small, offline tool that removes the manual steps observed, built in a few weeks without access to taxpayer data. To be scoped with the supervisor.",
  };
}

/* ───────────────────────── Teammate comparison ───────────────────────── */

export type ObserverStats = {
  observer: string;
  days: number;
  completion: number;
  avgWords: number;
  avgItems: number;
  avgPain: number | null;
  uniques: string[];
};

function words(e: LogEntry): number {
  const all = [
    ...e.tasksDid.map((t) => t.task),
    ...e.tasksSaw.map((t) => t.task),
    ...e.delays, ...e.repeated, ...e.mistakes, ...e.questions, ...e.complaints,
    e.learned, e.painTask, e.toolsOther, e.systemName,
  ].join(" ");
  return all.split(/\s+/).filter(Boolean).length;
}

const itemCount = (e: LogEntry) =>
  e.tasksDid.length + e.tasksSaw.length + e.delays.length + e.repeated.length + e.mistakes.length + e.questions.length + e.complaints.length;

export function compareObservers(logs: LogRecord[], from: string, to: string): ObserverStats[] {
  const inRange = logs.filter((l) => l.date >= from && l.date <= to);
  const elapsed = workingDays(from, to < todayAccra() ? to : todayAccra()).length;
  const days = elapsed || workingDays(from, to).length || 1;
  const observers = [...new Set(inRange.map((l) => l.observer))];
  const itemsBy = new Map(observers.map((o) => [o, itemsOf(inRange.filter((l) => l.observer === o))]));

  return observers.map((o) => {
    const mine = inRange.filter((l) => l.observer === o);
    // Only compare days both people logged, otherwise everything looks "unique".
    const myDays = new Set(mine.map((l) => l.date));
    const others = observers
      .filter((x) => x !== o)
      .flatMap((x) => itemsBy.get(x)!.filter((i) => myDays.has(i.date)).map((i) => ({ date: i.date, toks: tokens(i.text) })));
    const sharedDays = new Set(others.map((x) => x.date));
    const pains = mine.map((l) => l.entry.painScore).filter((p): p is number => p != null);
    const uniques = others.length
      ? [...new Set(itemsBy.get(o)!.filter((i) => sharedDays.has(i.date) && !others.some((t) => t.date === i.date && similarity(tokens(i.text), t.toks) >= SIMILAR)).map((i) => i.text))]
      : [];
    return {
      observer: o,
      days: mine.length,
      completion: Math.round((mine.length / days) * 100),
      avgWords: mine.length ? Math.round(mine.reduce((a, l) => a + words(l.entry), 0) / mine.length) : 0,
      avgItems: mine.length ? Math.round((mine.reduce((a, l) => a + itemCount(l.entry), 0) / mine.length) * 10) / 10 : 0,
      avgPain: pains.length ? Math.round((pains.reduce((a, b) => a + b, 0) / pains.length) * 10) / 10 : null,
      uniques: uniques.slice(0, 12),
    };
  });
}

/* ───────────────────────── Log form helpers ───────────────────────── */

/** Distinct task names used before, most frequent first (for quick-add). */
export function knownTasks(logs: LogRecord[]): string[] {
  return cluster(itemsOf(logs, ["task", "seen"]))
    .sort((a, b) => b.items.length - a.items.length)
    .map((c) => c.label)
    .slice(0, 15);
}

/** What to do today, based on the calendar and what's been logged. */
export function nextActions(logs: LogRecord[], today = todayAccra()): { label: string; href: string; tone: "primary" | "normal" }[] {
  const mine = logs.filter((l) => l.observer === "me");
  const out: { label: string; href: string; tone: "primary" | "normal" }[] = [];
  const inStudy = today >= study.start && today <= study.end;
  if (today < study.start) out.push({ label: `Observation starts ${formatDay(study.start)}. Read the ground rules and seed your process map.`, href: "/admin/research/map", tone: "normal" });
  if (inStudy && isWorkingDay(today) && !mine.some((l) => l.date === today)) out.push({ label: "Write today's log (5–10 minutes)", href: `/admin/research/log/${today}`, tone: "primary" });
  const missed = workingDays(study.start, today < study.end ? today : study.end).filter((d) => d < today && !mine.some((l) => l.date === d));
  if (missed.length) out.push({ label: `Catch up ${missed.length} missed day${missed.length === 1 ? "" : "s"} (${missed.slice(-3).map(formatDay).join(", ")})`, href: `/admin/research/log/${missed[missed.length - 1]}`, tone: "normal" });
  if (inStudy && weekday(today) === 5) out.push({ label: "Friday: review the week (20 minutes)", href: `/admin/research/week?w=${weekStart(today)}`, tone: "primary" });
  if (today >= study.chooseFrom) out.push({ label: "Choose the problem and write the one-page summary", href: "/admin/research/problems", tone: "primary" });
  return out;
}
