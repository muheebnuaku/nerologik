import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();

  const [leads, analyses] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("business_analyses").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminSidebar
        email={user.email ?? ""}
        newCounts={{ "/admin/leads": leads.count ?? 0, "/admin/analyses": analyses.count ?? 0 }}
      />
      <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto flex max-w-6xl flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}
