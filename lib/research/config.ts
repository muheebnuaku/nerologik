import { z } from "zod";

import { findSensitive } from "./privacy";

/** DMCE observation study. Dates are Africa/Accra (UTC+0, no DST). */
export const study = {
  title: "DMCE Observation",
  unit: "Debt Management, Compliance and Enforcement",
  start: "2026-11-09",
  end: "2026-11-30",
  /** End-of-month problem choice window. */
  chooseFrom: "2026-11-28",
  goal: "Understand how the DMCE unit works so we can pick one real problem to solve in December.",
};

export const groundRules = [
  "Record the process, never the taxpayer. No names, TINs, account numbers, amounts owed per person, or bank details.",
  "Use counts and rough figures only, e.g. “sent 40 notices to 6 banks”.",
  "Do not photograph documents, screens or files.",
  "Nothing from GRA systems goes into shared drives or AI tools.",
  "Observe and ask questions. Do not suggest fixes yet.",
  "Spend 5–10 minutes at the end of each day writing the log.",
];

export const toolOptions = [
  { value: "excel", label: "Excel" },
  { value: "paper", label: "Paper forms" },
  { value: "letters", label: "Printed letters" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone calls" },
  { value: "gra-system", label: "GRA internal system" },
  { value: "other", label: "Other" },
] as const;

export const roleOptions = ["Officer", "Supervisor", "NSS personnel", "Manager", "Other"] as const;

export const defaultSteps: { title: string; keywords: string[] }[] = [
  { title: "How a taxpayer is identified as owing", keywords: ["identify", "owing", "arrears", "assessment", "outstanding", "debtor"] },
  { title: "How the debtor list is prepared", keywords: ["list", "debtor", "spreadsheet", "excel", "prepare", "compile"] },
  { title: "How notices are drafted and approved", keywords: ["draft", "notice", "approve", "approval", "sign", "signature", "letter"] },
  { title: "How notices are delivered to banks", keywords: ["deliver", "dispatch", "bank", "send", "sent", "courier", "submit"] },
  { title: "How stamped copies are filed", keywords: ["stamp", "stamped", "file", "filing", "copy", "copies", "archive"] },
  { title: "How bank responses and payments are tracked", keywords: ["response", "respond", "payment", "track", "follow", "reconcile", "status"] },
  { title: "How a case is closed", keywords: ["close", "closed", "closure", "clear", "settled", "complete"] },
];

export const defaultQuestions = [
  "What takes most of your time each week?",
  "If one task disappeared, which would you pick?",
  "How do you know the status of a case right now?",
  "How do you report progress to your supervisor?",
  "What information is hardest to find?",
];

export const weeklyPrompts = [
  { key: "topTasks", label: "Which tasks showed up most often?" },
  { key: "painTasks", label: "Which task had the highest pain scores?" },
  { key: "tools", label: "What tools does the unit depend on most?" },
  { key: "people", label: "Who are the key people for each step of the process?" },
  { key: "unknowns", label: "What do I still not understand?" },
] as const;

export type WeeklyKey = (typeof weeklyPrompts)[number]["key"];

/* ───────────────────────── Log entry schema ───────────────────────── */

/** Text that must not contain identifiers. Checked on client and server. */
const safeText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .superRefine((v, ctx) => {
      const hits = findSensitive(v);
      if (hits.length) ctx.addIssue({ code: "custom", message: `Remove ${hits.map((h) => h.label).join(", ")}: record the process, not the taxpayer.` });
    });

const optNum = z.number().int().min(0).max(100000).nullable();

export const taskItem = z.object({
  task: safeText(300).pipe(z.string().min(2, "Describe the task")),
  count: optNum,
  minutes: optNum,
  role: z.string().max(60).optional(),
});

const list = (max = 300) => z.array(safeText(max).pipe(z.string().min(2))).max(30);

export const logEntrySchema = z.object({
  tasksDid: z.array(taskItem).max(30),
  tasksSaw: z.array(taskItem).max(30),
  tools: z.array(z.enum(toolOptions.map((t) => t.value) as [string, ...string[]])).max(10),
  systemName: safeText(120),
  toolsOther: safeText(200),
  delays: list(),
  repeated: list(),
  mistakes: list(),
  questions: list(),
  complaints: list(),
  learned: safeText(1000),
  painTask: safeText(300),
  painScore: z.number().int().min(1).max(5).nullable(),
});

export type LogEntry = z.infer<typeof logEntrySchema>;
export type TaskItem = z.infer<typeof taskItem>;

export const emptyEntry = (): LogEntry => ({
  tasksDid: [],
  tasksSaw: [],
  tools: [],
  systemName: "",
  toolsOther: "",
  delays: [],
  repeated: [],
  mistakes: [],
  questions: [],
  complaints: [],
  learned: "",
  painTask: "",
  painScore: null,
});

/** Tolerant read of a stored entry (older/partial rows never crash a page). */
export function readEntry(raw: unknown): LogEntry {
  const base = emptyEntry();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    tasksDid: arr<TaskItem>(r.tasksDid),
    tasksSaw: arr<TaskItem>(r.tasksSaw),
    tools: arr<string>(r.tools),
    systemName: str(r.systemName),
    toolsOther: str(r.toolsOther),
    delays: arr<string>(r.delays),
    repeated: arr<string>(r.repeated),
    mistakes: arr<string>(r.mistakes),
    questions: arr<string>(r.questions),
    complaints: arr<string>(r.complaints),
    learned: str(r.learned),
    painTask: str(r.painTask),
    painScore: typeof r.painScore === "number" ? r.painScore : null,
  };
}
