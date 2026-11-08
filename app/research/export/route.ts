import { formatDay } from "@/lib/research/analysis";
import { toolOptions, type LogEntry } from "@/lib/research/config";
import { getLogs, getQuestions, getSteps, researchContext } from "@/lib/research/data";

/** Downloads all of the signed-in admin's research notes as Markdown. */
export async function GET() {
  const { supabase } = await researchContext();
  const [logs, steps, questions, weekly] = await Promise.all([
    getLogs(),
    getSteps(),
    getQuestions(),
    supabase.from("research_weekly_reviews").select("week_start, notes").order("week_start"),
  ]);

  const list = (title: string, items: string[]) => (items.length ? `**${title}**\n${items.map((i) => `- ${i}`).join("\n")}\n` : "");
  const tasks = (t: LogEntry["tasksDid"]) => t.map((x) => `${x.task}${x.role ? ` (${x.role})` : ""}${x.count != null ? `, ${x.count} items` : ""}${x.minutes != null ? `, ~${x.minutes} min` : ""}`);
  const tool = (v: string) => toolOptions.find((t) => t.value === v)?.label ?? v;

  const md = [
    `# DMCE Observation notes`,
    `Exported ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`,
    ``,
    `## Daily logs`,
    ...logs.map(({ date, observer, entry: e }) =>
      [
        `### ${formatDay(date)}${observer !== "me" ? ` — ${observer}` : ""}`,
        list("1. Tasks I did", tasks(e.tasksDid)),
        list("2. Tasks I saw others do", tasks(e.tasksSaw)),
        list("3. Tools", [...e.tools.map(tool), e.systemName && `System: ${e.systemName}`, e.toolsOther && `Other: ${e.toolsOther}`].filter(Boolean) as string[]),
        list("4. Waiting and delays", e.delays),
        list("5. Repeated work", e.repeated),
        list("6. Mistakes or rework", e.mistakes),
        list("7. Questions people kept asking", e.questions),
        list("8. Complaints", e.complaints),
        e.learned ? `**9. Learned:** ${e.learned}\n` : "",
        e.painScore ? `**10. Pain:** ${e.painScore}/5 — ${e.painTask}\n` : "",
      ].join("\n"),
    ),
    `## Process map`,
    ...steps.map((s, i) => `${i + 1}. **${s.title}** — tool: ${s.tool ?? "?"}; owner: ${s.owner ?? "?"}${s.notes ? `\n   ${s.notes}` : ""}`),
    ``,
    `## Weekly reviews`,
    ...(weekly.data ?? []).map((w) => `### Week of ${formatDay(w.week_start)}\n${Object.values(w.notes as Record<string, string>).join("\n\n")}\n`),
    `## Questions`,
    ...questions.map((q) => `- [${q.status === "answered" ? "x" : " "}] ${q.question}${q.answer ? `\n  ↳ ${q.answer}` : ""}`),
  ].join("\n");

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="dmce-notes-${new Date().toISOString().slice(0, 10)}.md"`,
      "Cache-Control": "no-store",
    },
  });
}
