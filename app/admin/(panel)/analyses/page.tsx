import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck, MailX } from "lucide-react";

import { AdminHeader, countByStatus, EmptyState, StatusBadge, StatusTabs, timeAgo } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { isLeadStatus } from "@/lib/admin/status";
import { formatRange, packages, type PackageId } from "@/lib/analyzer/catalog";
import { industryOptions, labelOf } from "@/lib/analyzer/options";

export const metadata: Metadata = { title: "AI analyses" };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AnalysesPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = isLeadStatus(status) ? status : undefined;
  const { supabase } = await requireAdmin();

  const [all, list] = await Promise.all([
    supabase.from("business_analyses").select("status"),
    (() => {
      let q = supabase
        .from("business_analyses")
        .select(
          "id, created_at, business_name, contact_name, email, industry, city, country, recommended_service, currency, estimate_min, estimate_max, monthly_min, monthly_max, email_sent_at, engine, status",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter) q = q.eq("status", filter);
      return q;
    })(),
  ]);

  return (
    <>
      <AdminHeader title="AI analyses" description="Businesses that ran the analyser, with their recommendation and estimate." />
      <StatusTabs base="/admin/analyses" current={filter} counts={countByStatus(all.data ?? [])} />

      {list.error ? (
        <EmptyState>
          Couldn&apos;t load analyses: {list.error.message}. Have you run the business_analyses migration?
        </EmptyState>
      ) : list.data?.length ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {list.data.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/analyses/${a.id}`} className="grid gap-1 px-4 py-3 hover:bg-accent sm:grid-cols-[16rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{a.business_name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {a.contact_name} · {a.city}, {a.country}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs text-muted-foreground">
                    {labelOf(industryOptions, a.industry)} · {a.engine === "ai" ? "AI" : "Rules"}
                  </span>
                  <span className="block truncate text-sm">
                    {packages[a.recommended_service as PackageId]?.name ?? a.recommended_service} ·{" "}
                    <span className="font-medium">{formatRange(a.estimate_min, a.estimate_max, a.currency)}</span>
                    {a.monthly_max > 0 && <span className="text-muted-foreground"> + {formatRange(a.monthly_min, a.monthly_max, a.currency)}/mo</span>}
                  </span>
                </span>
                <span className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  <span className="flex items-center gap-2">
                    {a.email_sent_at ? (
                      <MailCheck className="size-4 text-brand" aria-label="Estimate emailed" />
                    ) : (
                      <MailX className="size-4 text-destructive" aria-label="Estimate not emailed" />
                    )}
                    <StatusBadge status={a.status} />
                  </span>
                  <span className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No analyses{filter ? " with this status" : " yet"}.</EmptyState>
      )}
    </>
  );
}
