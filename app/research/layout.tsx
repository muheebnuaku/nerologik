import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Lock, LogOut, ShieldAlert } from "lucide-react";

import { signOutResearcher } from "@/app/rit/actions";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ResearchTabs } from "@/components/research/tabs";
import { formatDay } from "@/lib/research/analysis";
import { requireResearcher } from "@/lib/research/auth";
import { groundRules, study } from "@/lib/research/config";

export const metadata: Metadata = {
  title: { default: "Research", template: "%s · Research" },
  robots: { index: false, follow: false },
};

// Personal, per-user data.
export const dynamic = "force-dynamic";

export default async function ResearchLayout({ children }: { children: React.ReactNode }) {
  const { researcher } = await requireResearcher();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/research" className="flex items-center gap-2 rounded-md" aria-label="Research home">
            <Logo />
            <span className="hidden rounded-md bg-brand-soft px-2 py-0.5 font-mono text-xs text-brand sm:inline">RIT</span>
          </Link>
          <div className="flex items-center gap-1">
            {researcher.isAdmin && (
              <Link href="/admin" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                <LayoutDashboard className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <span className="hidden max-w-40 truncate px-2 text-sm text-muted-foreground md:inline">{researcher.name}</span>
            <ThemeToggle />
            <form action={signOutResearcher}>
              <button type="submit" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                <LogOut className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1.5 font-mono text-eyebrow uppercase text-brand">
            <Lock className="size-3" aria-hidden="true" /> Private research · only you can see your notes
          </p>
          <h1 className="font-display text-2xl font-semibold">{study.title}</h1>
          <p className="text-sm text-muted-foreground">
            {study.unit} · {formatDay(study.start)} – {formatDay(study.end)} 2026. {study.goal}
          </p>
        </div>

        <details className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-medium">
            <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" /> Ground rules (identifiers are blocked automatically)
          </summary>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
            {groundRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>

        <ResearchTabs />
        {children}
      </div>
    </div>
  );
}
