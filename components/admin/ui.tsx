import Link from "next/link";

import { leadStatuses } from "@/lib/admin/status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const s = leadStatuses.find((x) => x.value === status);
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", s?.className ?? "bg-secondary")}>
      {s?.label ?? status}
    </span>
  );
}

export function AdminHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

/** Status filter tabs driven by ?status= */
export function StatusTabs({ base, current, counts }: { base: string; current?: string; counts: Record<string, number> }) {
  const tabs = [{ value: undefined, label: "All" }, ...leadStatuses.map((s) => ({ value: s.value as string | undefined, label: s.label }))];
  return (
    <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5">
      {tabs.map((t) => {
        const active = t.value === current;
        const count = t.value ? (counts[t.value] ?? 0) : Object.values(counts).reduce((a, b) => a + b, 0);
        return (
          <Link
            key={t.label}
            href={t.value ? `${base}?status=${t.value}` : base}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              active ? "border-primary bg-brand-soft text-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label} <span className="ml-1 tabular-nums text-xs opacity-70">{count}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{children}</p>;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra" });
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));

export function timeAgo(iso: string): string {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : formatDate(iso);
}

export function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  );
}

/** Counts rows per status (used by the tabs). */
export function countByStatus(rows: { status: string }[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
}
