import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";

import { updateAnalysis } from "@/app/admin/actions";
import { ReportView } from "@/components/analyzer/report-view";
import { ResendButton, StatusForm } from "@/components/admin/forms";
import { Detail, formatDate, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { describeAnswers } from "@/lib/analyzer/engine";
import type { AnalysisReport } from "@/lib/analyzer/report";
import type { AnalysisInput } from "@/lib/validations/analysis";

export const metadata: Metadata = { title: "Analysis" };

type Props = { params: Promise<{ id: string }> };

export default async function AnalysisDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: a } = await supabase.from("business_analyses").select("*").eq("id", id).maybeSingle();
  if (!a) notFound();

  const report = a.report as unknown as AnalysisReport;
  const answers = a.answers as unknown as AnalysisInput;
  const waNumber = a.phone?.replace(/[^\d]/g, "");

  return (
    <>
      <Link href="/admin/analyses" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> AI analyses
      </Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">{a.business_name}</h1>
          <p className="text-sm text-muted-foreground">
            {a.contact_name} · {a.city}, {a.country} · {formatDate(a.created_at)}
          </p>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-xl border border-border bg-card p-5">
            <ReportView report={report} businessName={a.business_name} />
          </section>

          <details className="rounded-xl border border-border bg-card p-5">
            <summary className="cursor-pointer font-semibold">Client&apos;s answers</summary>
            <pre className="mt-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{describeAnswers(answers)}</pre>
          </details>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Contact</h2>
            <dl className="flex flex-col gap-3">
              <Detail label="Email">
                <a href={`mailto:${a.email}`} className="text-brand hover:underline">
                  {a.email}
                </a>
              </Detail>
              {a.phone && <Detail label="Phone">{a.phone}</Detail>}
              <Detail label="Estimate email">
                {a.email_sent_at ? (
                  `Sent ${formatDate(a.email_sent_at)}`
                ) : (
                  <span className="text-destructive">Not sent{a.email_error ? `: ${a.email_error}` : ""}</span>
                )}
              </Detail>
              <Detail label="Engine">{a.engine === "ai" ? `AI (${a.model})` : "Rules (no AI key or AI failed)"}</Detail>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={`mailto:${a.email}?subject=${encodeURIComponent(`Your analysis for ${a.business_name}`)}`}>
                  <Mail /> Email
                </a>
              </Button>
              {a.phone && (
                <Button asChild size="sm" variant="outline">
                  <a href={`tel:${a.phone}`}>
                    <Phone /> Call
                  </a>
                </Button>
              )}
              {waNumber && (
                <Button asChild size="sm" variant="outline">
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> WhatsApp
                  </a>
                </Button>
              )}
            </div>
            <ResendButton id={a.id} label={a.email_sent_at ? "Resend estimate email" : "Send estimate email"} />
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Pipeline</h2>
            <StatusForm id={a.id} status={a.status} notes={a.notes} action={updateAnalysis} />
          </section>
        </aside>
      </div>
    </>
  );
}
