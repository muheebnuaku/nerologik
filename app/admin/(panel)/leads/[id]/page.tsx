import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";

import { updateLead } from "@/app/admin/actions";
import { StatusForm } from "@/components/admin/forms";
import { Detail, formatDate, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { labelOf } from "@/lib/analyzer/options";
import { siteConfig } from "@/lib/site-config";
import { budgetOptions, serviceOptions } from "@/lib/validations/lead";

export const metadata: Metadata = { title: "Enquiry" };

type Props = { params: Promise<{ id: string }> };

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) notFound();

  const subject = encodeURIComponent(`Re: your enquiry to ${siteConfig.name}`);

  return (
    <>
      <Link href="/admin/leads" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Enquiries
      </Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">{lead.name}</h1>
          <p className="text-sm text-muted-foreground">
            {lead.company ? `${lead.company} · ` : ""}
            {formatDate(lead.created_at)}
          </p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail label="Email">
              <a href={`mailto:${lead.email}`} className="text-brand hover:underline">
                {lead.email}
              </a>
            </Detail>
            <Detail label="Service">{labelOf(serviceOptions, lead.service)}</Detail>
            <Detail label="Budget">{labelOf(budgetOptions, lead.budget)}</Detail>
            <Detail label="Source">{lead.source ?? "—"}</Detail>
          </dl>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground">Message</p>
            <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button asChild>
              <a href={`mailto:${lead.email}?subject=${subject}`}>
                <Mail /> Reply by email
              </a>
            </Button>
          </div>
        </section>

        <aside className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Pipeline</h2>
          <StatusForm id={lead.id} status={lead.status} notes={lead.notes} action={updateLead} />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle className="size-3.5" aria-hidden="true" /> Updated {formatDate(lead.updated_at)}
          </p>
        </aside>
      </div>
    </>
  );
}
