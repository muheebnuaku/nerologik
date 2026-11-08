"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/research", label: "Overview", exact: true },
  { href: "/research/log", label: "Daily log" },
  { href: "/research/week", label: "Weekly review" },
  { href: "/research/map", label: "Process map" },
  { href: "/research/questions", label: "Questions" },
  { href: "/research/compare", label: "Teammate" },
  { href: "/research/problems", label: "Choose problem" },
];

export function ResearchTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Research" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border px-1 pb-px">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-sm transition-colors",
              active ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
