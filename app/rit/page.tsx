import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck, Lock, NotebookPen, Target } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { RitForms } from "@/components/rit/rit-forms";
import { formatDay } from "@/lib/research/analysis";
import { study } from "@/lib/research/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "RIT · Research team",
  description: "Create your RIT research account to keep a private daily observation journal.",
  robots: { index: false, follow: false },
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
    { icon: NotebookPen, text: "A 10-question daily log that takes 5 minutes" },
    { icon: CalendarCheck, text: `Weekly reviews drafted for you, ${formatDay(study.start)} – ${formatDay(study.end)}` },
    { icon: Target, text: "Problems ranked automatically from your notes" },
    { icon: Lock, text: "Private: only you can see your journal" },
  ];

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:items-center">
        <div className="flex flex-col gap-4">
          <Link href="/" className="w-fit rounded-md" aria-label="Nerologik home">
            <Logo />
          </Link>
          <div className="flex flex-col gap-2">
            <p className="font-mono text-eyebrow uppercase text-brand">RIT · Research team</p>
            <h1 className="text-display-lg font-semibold">Your private observation journal.</h1>
            <p className="text-muted-foreground">
              {study.unit}. {study.goal}
            </p>
          </div>
          <ul className="flex flex-col gap-2.5">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <p.icon className="size-4" aria-hidden="true" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <RitForms needsCode={!!process.env.RIT_INVITE_CODE} initialError={error ? errors[error] : undefined} />
        </div>
      </div>
    </div>
  );
}
