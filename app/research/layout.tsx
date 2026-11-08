import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Lock, LogOut, ShieldAlert } from "lucide-react";

import { signOutResearcher } from "@/app/rit/actions";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ResearchBottomNav, ResearchTabs } from "@/components/research/tabs";
import { formatDay, todayAccra, workingDays } from "@/lib/research/analysis";
import { requireResearcher } from "@/lib/research/auth";
import { groundRules, study } from "@/lib/research/config";

export const metadata: Metadata = {
  title: { default: "Research", template: "%s · RIT" },
  robots: { index: false, follow: false },
  manifest: "/rit/manifest.webmanifest",
  appleWebApp: { capable: true, title: "RIT", statusBarStyle: "default" },
};

// Personal, per-user data.
export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export default async function ResearchLayout({ children }: { children: React.ReactNode }) {
  const { researcher } = await requireResearcher();
  const today = todayAccra();
  const days = workingDays();
  const done = days.filter((d) => d <= today).length;
  const pct = Math.round((done / days.length) * 100);
  const status =
    today < study.start ? `Starts ${formatDay(study.start)}` : today > study.end ? "Study complete" : `Day ${done} of ${days.length}`;

  return (
    <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-10">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/research" className="flex items-center gap-2 rounded-md" aria-label="Research home">
            <Logo />
            <span className="rounded-md bg-brand-soft px-1.5 py-0.5 font-mono text-[0.6875rem] font-semibold text-brand">RIT</span>
          </Link>
          <div className="flex items-center gap-1">
            {researcher.isAdmin && (
              <Link href="/admin" className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground md:flex">
                <LayoutDashboard className="size-4" aria-hidden="true" /> Admin
              </Link>
            )}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <form action={signOutResearcher} className="hidden md:block">
              <button type="submit" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                <LogOut className="size-4" aria-hidden="true" /> Sign out
              </button>
            </form>
            <span
              className="ml-1 flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              title={researcher.name}
              aria-label={`Signed in as ${researcher.name}`}
            >
              {initials(researcher.name) || "R"}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <section className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-brand">
                <Lock className="size-3" aria-hidden="true" /> Private · only you see your notes
              </p>
              <h1 className="mt-1 font-display text-xl font-semibold sm:text-2xl">{study.title}</h1>
              <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">
                {study.unit} · {formatDay(study.start)} – {formatDay(study.end)}. {study.goal}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium tabular-nums">{status}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label="Study progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
          </div>

          <details className="group rounded-xl border border-amber-500/30 bg-amber-500/5 text-sm">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3.5 font-medium [&::-webkit-details-marker]:hidden">
              <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span className="flex-1">Ground rules</span>
              <span className="text-xs font-normal text-muted-foreground group-open:hidden">Identifiers are blocked automatically</span>
            </summary>
            <ul className="flex list-disc flex-col gap-1.5 px-3.5 pb-3 pl-8 text-muted-foreground">
              {groundRules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </details>
        </section>

        <ResearchTabs />
        {children}
      </div>

      <ResearchBottomNav today={today} isAdmin={researcher.isAdmin} name={researcher.name} />
    </div>
  );
}
