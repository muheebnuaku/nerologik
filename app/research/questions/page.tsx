import { AddQuestion, QuestionRow } from "@/components/research/editors";
import { getQuestions } from "@/lib/research/data";

export const metadata = { title: "Questions" };

export default async function QuestionsPage() {
  const questions = await getQuestions();
  const groups = [
    { title: "To ask", items: questions.filter((q) => q.status === "open") },
    { title: "Asked, waiting for an answer", items: questions.filter((q) => q.status === "asked") },
    { title: "Answered", items: questions.filter((q) => q.status === "answered") },
  ];

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Ask when the moment is right. Weekly reviews and process-map gaps add questions here automatically. Tick a question once answered, and click it to note what you learned.
      </p>
      <AddQuestion />
      {groups
        .filter((g) => g.items.length)
        .map((g) => (
          <section key={g.title} className="overflow-hidden rounded-xl border border-border bg-card">
            <h2 className="border-b border-border px-4 py-2.5 text-sm font-semibold">
              {g.title} <span className="font-normal text-muted-foreground">({g.items.length})</span>
            </h2>
            <ul className="divide-y divide-border">
              {g.items.map((q) => (
                <QuestionRow key={`${q.id}-${q.status}-${q.answer ?? ""}`} q={q} />
              ))}
            </ul>
          </section>
        ))}
    </>
  );
}
