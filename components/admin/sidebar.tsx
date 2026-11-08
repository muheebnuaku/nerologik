"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Inbox, LayoutDashboard, LogOut, Mail, NotebookPen, Sparkles, Users } from "lucide-react";

import { signOut } from "@/app/admin/actions";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Enquiries", icon: Inbox },
  { href: "/admin/analyses", label: "AI analyses", icon: Sparkles },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/rit", label: "RIT members", icon: Users },
  { href: "/research", label: "My research", icon: NotebookPen },
];

export function AdminSidebar({ email, newCounts }: { email: string; newCounts: Record<string, number> }) {
  const pathname = usePathname();
  return (
    <aside className="flex shrink-0 flex-col gap-4 border-b border-border bg-card px-4 py-3 lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:border-r lg:border-b-0 lg:py-5">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="rounded-md" aria-label="Admin home">
          <Logo />
        </Link>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </div>

      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const count = newCounts[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
              {count ? (
                <span className="ml-auto rounded-full bg-primary px-1.5 text-[0.6875rem] font-semibold text-primary-foreground tabular-nums">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-2 border-t border-border pt-4 lg:flex">
        <Link href="/" target="_blank" className="flex items-center gap-2 px-3 text-sm text-muted-foreground hover:text-foreground">
          <ExternalLink className="size-4" aria-hidden="true" /> View site
        </Link>
        <p className="truncate px-3 text-xs text-muted-foreground" title={email}>
          {email}
        </p>
        <div className="flex items-center justify-between gap-2 px-1">
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </button>
          </form>
          <ThemeToggle />
        </div>
      </div>
      <form action={signOut} className="lg:hidden">
        <button type="submit" className="flex items-center gap-2 text-xs text-muted-foreground">
          <LogOut className="size-3.5" aria-hidden="true" /> Sign out ({email})
        </button>
      </form>
    </aside>
  );
}
