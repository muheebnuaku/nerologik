import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Inbox, Mail, Sparkles, TrendingUp } from "lucide-react";

import { AdminHeader, EmptyState, StatusBadge, timeAgo } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { formatRange, packages, type PackageId } from "@/lib/analyzer/catalog";
import { labelOf } from "@/lib/analyzer/options";
import { serviceOptions } from "@/lib/validations/lead";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString();

  const [newLeads, newAnalyses, weekAnalyses, subscribers, recentLeads, recentAnalyses] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("business_analyses").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("business_analyses").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed"),
    supabase.from("leads").select("id, created_at, name, company, service, status").order("created_at", { ascending: false }).limit(6),
    supabase
      .from("business_analyses")
      .select("id, created_at, business_name, city, recommended_service, currency, estimate_min, estimate_max, status")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const stats = [
    { label: "New enquiries", value: newLeads.count ?? 0, icon: Inbox, href: "/admin/leads?status=new" },
    { label: "New analyses", value: newAnalyses.count ?? 0, icon: Sparkles, href: "/admin/analyses?status=new" },
    { label: "Analyses this week", value: weekAnalyses.count ?? 0, icon: TrendingUp, href: "/admin/analyses" },
    { label: "Subscribers", value: subscribers.count ?? 0, icon: Mail, href: "/admin/subscribers" },
  ];

  return (
    <>
      <AdminHeader title="Overview" description="What's come in from the website." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40">
            <s.icon className="size-4 text-brand" aria-hidden="true" />
            <span className="font-display text-2xl font-semibold tabular-nums">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Latest enquiries" href="/admin/leads">
          {recentLeads.data?.length ? (
            <ul className="divide-y divide-border">
              {recentLeads.data.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-accent">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {l.name}
                        {l.company ? <span className="font-normal text-muted-foreground"> · {l.company}</span> : null}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {labelOf(serviceOptions, l.service)} · {timeAgo(l.created_at)}
                      </span>
                    </span>
                    <StatusBadge status={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No enquiries yet.</EmptyState>
          )}
        </Panel>

        <Panel title="Latest AI analyses" href="/admin/analyses">
          {recentAnalyses.data?.length ? (
            <ul className="divide-y divide-border">
              {recentAnalyses.data.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/analyses/${a.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-accent">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {a.business_name} <span className="font-normal text-muted-foreground">· {a.city}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {packages[a.recommended_service as PackageId]?.name ?? a.recommended_service} ·{" "}
                        {formatRange(a.estimate_min, a.estimate_max, a.currency)} · {timeAgo(a.created_at)}
                      </span>
                    </span>
                    <StatusBadge status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No analyses yet. Share /analyzer with prospects.</EmptyState>
          )}
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="flex items-center gap-1 text-sm text-brand hover:underline">
          View all <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      {children}
    </section>
  );
}
