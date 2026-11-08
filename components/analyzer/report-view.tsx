import { CheckCircle2, Gauge, Lightbulb, MapPin, Sparkles, TrendingUp, Users } from "lucide-react";

import { formatMoney, formatRange } from "@/lib/analyzer/catalog";
import type { AnalysisReport } from "@/lib/analyzer/report";
import { cn } from "@/lib/utils";

const impactStyle = {
  high: "bg-brand-soft text-brand",
  medium: "bg-secondary text-foreground",
  low: "bg-secondary text-muted-foreground",
} as const;

/** Renders a finished analysis. Server-safe: no hooks. */
export function ReportView({ report: r, businessName }: { report: AnalysisReport; businessName: string }) {
  const e = r.estimate;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-eyebrow uppercase text-brand">Analysis for {businessName}</p>
        <h2 className="text-display-md font-semibold">{r.headline}</h2>
        <p className="text-muted-foreground">{r.summary}</p>
      </header>

      {/* Recommendation + estimate */}
      <section className="grid gap-4 rounded-xl border-2 border-primary/60 bg-brand-soft p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 font-mono text-eyebrow uppercase text-brand">
            <Sparkles className="size-3.5" aria-hidden="true" /> Recommended for you
          </p>
          <h3 className="font-display text-xl font-semibold">{r.recommendation.title}</h3>
          <p className="text-sm text-muted-foreground">
            {r.recommendation.packageName} · {r.recommendation.timeline}
          </p>
          <p className="text-sm">{r.recommendation.why}</p>
          <ul className="mt-1 grid gap-1.5 sm:grid-cols-2">
            {r.recommendation.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 md:min-w-56">
          <p className="text-xs text-muted-foreground">Estimated investment</p>
          <p className="font-display text-2xl font-semibold">{formatRange(e.oneTimeMin, e.oneTimeMax, e.currency)}</p>
          {e.monthlyMax > 0 && (
            <p className="text-sm text-muted-foreground">
              + {formatRange(e.monthlyMin, e.monthlyMax, e.currency)} / month
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Cost breakdown */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-semibold">Cost breakdown</h3>
          <dl className="flex flex-col">
            {e.lineItems.map((li) => (
              <div key={li.item} className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
                <dt>{li.item}</dt>
                <dd className="shrink-0 font-medium tabular-nums">{formatMoney(li.amount, e.currency)}</dd>
              </div>
            ))}
          </dl>
          {e.assumptions.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
              {e.assumptions.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Profile */}
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Gauge className="size-5 text-brand" aria-hidden="true" />
            <h3 className="font-semibold">
              Digital maturity: {r.digitalMaturity.score}/10 · {r.digitalMaturity.label}
            </h3>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: `${r.digitalMaturity.score * 10}%` }} />
          </div>
          <p className="text-sm text-muted-foreground">{r.digitalMaturity.explanation}</p>
          <p className="flex gap-2 text-sm">
            <Users className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <span className="text-muted-foreground">{r.customerInsight}</span>
          </p>
          <p className="flex gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <span className="text-muted-foreground">{r.locationInsight}</span>
          </p>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Lightbulb className="size-4 text-brand" aria-hidden="true" /> Key findings
          </h3>
          <ul className="flex flex-col gap-2.5">
            {r.keyFindings.map((f) => (
              <li key={f.title} className="text-sm">
                <span className="font-medium">{f.title}.</span>{" "}
                <span className="text-muted-foreground">{f.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <TrendingUp className="size-4 text-brand" aria-hidden="true" /> Opportunities
          </h3>
          <ul className="flex flex-col gap-2.5">
            {r.opportunities.map((o) => (
              <li key={o.title} className="text-sm">
                <span className={cn("mr-2 rounded px-1.5 py-0.5 text-[0.6875rem] font-medium uppercase", impactStyle[o.impact])}>
                  {o.impact}
                </span>
                <span className="font-medium">{o.title}.</span>{" "}
                <span className="text-muted-foreground">{o.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 font-semibold">Your roadmap</h3>
        <ol className="grid gap-4 md:grid-cols-3">
          {r.roadmap.map((ph, i) => (
            <li key={ph.phase} className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">
                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {i + 1}
                </span>
                {ph.phase} <span className="font-normal text-muted-foreground">· {ph.timeframe}</span>
              </p>
              <ul className="flex flex-col gap-1 pl-7 text-sm text-muted-foreground">
                {ph.actions.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">{r.expectedImpact}</p>
      </section>

      {r.addOns.length > 0 && (
        <section className="rounded-xl border border-dashed border-border p-5">
          <h3 className="mb-3 font-semibold">Worth considering later</h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {r.addOns.map((a) => (
              <li key={a.packageId} className="text-sm">
                <span className="font-medium">{a.name}</span>{" "}
                <span className="text-muted-foreground">(from {formatMoney(a.priceFrom, e.currency)}). {a.why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
