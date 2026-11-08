import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck, Lock, NotebookPen, ShieldCheck, Target } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { RitForms } from "@/components/rit/rit-forms";
import { formatDay, workingDays } from "@/lib/research/analysis";
import { study } from "@/lib/research/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "RIT · Research team",
  description: "Create your RIT research account to keep a private daily observation journal.",
  robots: { index: false, follow: false },
  manifest: "/rit/manifest.webmanifest",
  appleWebApp: { capable: true, title: "RIT", statusBarStyle: "default" },
};

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  config: "Accounts aren't available yet: the server isn't fully configured.",
  "no-access": "This account doesn't have research access. Create an RIT account or ask the team.",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function RitPage({ searchParams }: Props) {
  const { error } = await searchParams;

  // Already signed in with access? Go straight to the journal.
  if (!error && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const [{ data: admin }, { data: member }] = await Promise.all([
        supabase.rpc("is_admin"),
        supabase.from("rit_members").select("user_id").eq("user_id", data.user.id).maybeSingle(),
      ]);
      if (admin || member) redirect("/research");
    }
  }

  const perks = [
    { icon: NotebookPen, title: "5-minute daily log", text: "Ten quick questions at the end of each day." },
    { icon: CalendarCheck, title: "Reviews drafted for you", text: "Every Friday, built from your own notes." },
    { icon: Target, title: "Problems ranked automatically", text: "Pick the one worth solving with evidence." },
    { icon: Lock, title: "Completely private", text: "Only you can read your journal." },
  ];

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-grid mask-hero absolute inset-0" />
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-glow opacity-60 blur-glow" />
      </div>

      <header className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2 sm:px-6">
        <Link href="/" className="rounded-md" aria-label="Nerologik home">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-8 px-4 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] md:items-center md:gap-12">
        {/* Intro: short on phones so the form is on screen straight away */}
        <div className="flex flex-col gap-3 md:gap-5">
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-brand-soft px-3 py-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-brand">
            RIT · Research team
          </p>
          <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight sm:text-display-lg">Your private observation journal.</h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            {study.unit} · {formatDay(study.start)} – {formatDay(study.end)} ({workingDays().length} working days).
          </p>
          <ul className="mt-2 hidden flex-col gap-4 md:flex">
            {perks.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <p.icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{p.title}</span>
                  <span className="block text-sm text-muted-foreground">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-xl shadow-black/5 backdrop-blur sm:p-6">
          <RitForms needsCode={!!process.env.RIT_INVITE_CODE} initialError={error ? errors[error] : undefined} />
        </div>

        {/* Perks below the form on phones */}
        <ul className="grid grid-cols-2 gap-3 md:hidden">
          {perks.map((p) => (
            <li key={p.title} className="flex flex-col gap-2 rounded-xl border border-border bg-card/80 p-3">
              <p.icon className="size-4 text-brand" aria-hidden="true" />
              <span className="text-sm leading-snug font-medium">{p.title}</span>
            </li>
          ))}
        </ul>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground md:col-span-2">
          <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" /> Record the process, never the taxpayer. Identifiers are blocked automatically.
        </p>
      </main>
    </div>
  );
}
