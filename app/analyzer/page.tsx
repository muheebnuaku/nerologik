import type { Metadata } from "next";
import { Clock, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { AnalyzerWizard } from "@/components/analyzer/analyzer-wizard";
import { PageHeader } from "@/components/ui/page-header";

// The AI analysis runs inside the server action on this route and can take up to ~2 minutes.
export const maxDuration = 120;

export const metadata: Metadata = {
  title: "Free AI Business Analyser",
  description:
    "Answer 12 quick questions about your business and get a free AI analysis: the solution that fits best, a tailored roadmap and an estimated cost, sent to your inbox.",
  alternates: { canonical: "/analyzer" },
};

const perks = [
  { icon: Clock, text: "12 quick questions, about 3 minutes" },
  { icon: Sparkles, text: "Tailored to your location, customers and goals" },
  { icon: Mail, text: "Full report and estimate emailed to you" },
  { icon: ShieldCheck, text: "Free, no obligation, no spam" },
];

export default function AnalyzerPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Business Analyser"
        title="Find the right solution for your business, with a cost estimate."
        description="Tell us how your business runs today. Our AI analyst studies your location, customers and goals, then recommends what will make the biggest difference and what it will cost."
      />

      <section aria-label="Business analyser" className="section-y">
        <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-7 lg:col-span-8">
            <AnalyzerWizard />
          </div>
          <aside className="lg:col-span-4">
            <ul className="flex flex-col gap-3 rounded-xl border border-border p-5 lg:sticky lg:top-24">
              {perks.map((p) => (
                <li key={p.text} className="flex items-start gap-3 text-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <p.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="pt-1.5 text-muted-foreground">{p.text}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
