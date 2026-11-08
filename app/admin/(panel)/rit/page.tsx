import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { AdminHeader, EmptyState, formatDate, timeAgo } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { formatPhone } from "@/lib/rit/phone";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "RIT members" };

/** Members and how consistently they log. Notes themselves stay private to each member. */
export default async function RitMembersPage() {
  const { supabase } = await requireAdmin();
  const { data: members, error } = await supabase.from("rit_members").select("user_id, name, phone, created_at").order("created_at", { ascending: false });

  // Counts only (secret key), never note content.
  const stats = new Map<string, { logs: number; last: string | null }>();
  if (members?.length && process.env.SUPABASE_SECRET_KEY) {
    const { data } = await createAdminClient()
      .from("research_logs")
      .select("user_id, log_date")
      .eq("observer", "me")
      .in("user_id", members.map((m) => m.user_id));
    for (const r of data ?? []) {
      const s = stats.get(r.user_id) ?? { logs: 0, last: null };
      s.logs += 1;
      if (!s.last || r.log_date > s.last) s.last = r.log_date;
      stats.set(r.user_id, s);
    }
  }

  return (
    <>
      <AdminHeader title="RIT members" description="People with a research account. Their notes are private to them; you only see activity.">
        <Link href="/rit" target="_blank" className="flex items-center gap-1.5 text-sm text-brand hover:underline">
          Sign-up page <ExternalLink className="size-3.5" aria-hidden="true" />
        </Link>
      </AdminHeader>
      {error ? (
        <EmptyState>Couldn&apos;t load members: {error.message}. Have you run the RIT migration?</EmptyState>
      ) : members?.length ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 text-right font-medium">Days logged</th>
                <th className="px-4 py-2.5 font-medium">Last log</th>
                <th className="px-4 py-2.5 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((m) => {
                const s = stats.get(m.user_id);
                return (
                  <tr key={m.user_id}>
                    <td className="px-4 py-2.5 font-medium">{m.name}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <a href={`https://wa.me/${m.phone}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                        {formatPhone(m.phone)}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{s?.logs ?? 0}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s?.last ?? "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground" title={formatDate(m.created_at)}>
                      {timeAgo(m.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>No members yet. Share nerologik.com/rit with your team.</EmptyState>
      )}
    </>
  );
}
