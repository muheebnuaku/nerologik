import { Lock, ShieldAlert } from "lucide-react";

import { ResearchTabs } from "@/components/research/tabs";
import { groundRules, study } from "@/lib/research/config";

export const metadata = { title: { default: "Research", template: "%s · Research | Admin" } };

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 font-mono text-eyebrow uppercase text-brand">
          <Lock className="size-3" aria-hidden="true" /> Private research · only you can see this
        </p>
        <h1 className="font-display text-2xl font-semibold">{study.title}</h1>
        <p className="text-sm text-muted-foreground">
          {study.unit} · 10–30 November 2026. {study.goal}
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
  );
}
