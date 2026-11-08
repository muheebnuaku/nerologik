import type { Metadata } from "next";
import Link from "next/link";

import { AdminHeader, countByStatus, EmptyState, StatusBadge, StatusTabs, timeAgo } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { isLeadStatus } from "@/lib/admin/status";
import { labelOf } from "@/lib/analyzer/options";
import { budgetOptions, serviceOptions } from "@/lib/validations/lead";

export const metadata: Metadata = { title: "Enquiries" };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function LeadsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = isLeadStatus(status) ? status : undefined;
  const { supabase } = await requireAdmin();

  const [all, list] = await Promise.all([
    supabase.from("leads").select("status"),
    (() => {
      let q = supabase
        .from("leads")
        .select("id, created_at, name, email, company, service, budget, message, status")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter) q = q.eq("status", filter);
      return q;
    })(),
  ]);

  return (
    <>
      <AdminHeader title="Enquiries" description="Messages from the contact form." />
      <StatusTabs base="/admin/leads" current={filter} counts={countByStatus(all.data ?? [])} />

      {list.error ? (
        <EmptyState>Couldn&apos;t load enquiries: {list.error.message}</EmptyState>
      ) : list.data?.length ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {list.data.map((l) => (
            <li key={l.id}>
              <Link href={`/admin/leads/${l.id}`} className="grid gap-1 px-4 py-3 hover:bg-accent sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{l.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{l.company || l.email}</span>
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">
                    {labelOf(serviceOptions, l.service)} · {labelOf(budgetOptions, l.budget)}
                  </span>
                  <span className="block truncate text-sm">{l.message}</span>
                </span>
                <span className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  <StatusBadge status={l.status} />
                  <span className="text-xs text-muted-foreground">{timeAgo(l.created_at)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No enquiries{filter ? " with this status" : " yet"}.</EmptyState>
      )}
    </>
  );
}
