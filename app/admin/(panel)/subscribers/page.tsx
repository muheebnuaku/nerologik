import type { Metadata } from "next";

import { AdminHeader, EmptyState, formatDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, created_at, email, source, status")
    .order("created_at", { ascending: false })
    .limit(1000);

  const active = data?.filter((s) => s.status === "subscribed") ?? [];

  return (
    <>
      <AdminHeader title="Subscribers" description={`${active.length} subscribed to the newsletter.`} />
      {error ? (
        <EmptyState>Couldn&apos;t load subscribers: {error.message}</EmptyState>
      ) : data?.length ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2.5">{s.email}</td>
                  <td className="px-4 py-2.5 capitalize text-muted-foreground">{s.status}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.source ?? "—"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>No subscribers yet.</EmptyState>
      )}
    </>
  );
}
