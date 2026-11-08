"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CalendarDays,
  ClipboardList,
  Download,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  PenLine,
  Target,
  Users,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";

import { signOutResearcher } from "@/app/rit/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

type Tab = { href: string; label: string; short?: string; icon: LucideIcon; exact?: boolean };

const tabs: Tab[] = [
  { href: "/research", label: "Overview", short: "Home", icon: Home, exact: true },
  { href: "/research/log", label: "Daily log", short: "Logs", icon: PenLine },
  { href: "/research/week", label: "Weekly review", short: "Review", icon: CalendarDays },
  { href: "/research/map", label: "Process map", icon: Workflow },
  { href: "/research/questions", label: "Questions", icon: MessageCircleQuestion },
  { href: "/research/compare", label: "Teammate", icon: Users },
  { href: "/research/problems", label: "Choose problem", short: "Problem", icon: Target },
];

const isActive = (pathname: string, t: Tab) => (t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`));

/** Top tabs, tablet and desktop. */
export function ResearchTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Research" className="hidden gap-1 overflow-x-auto border-b border-border md:flex">
      {tabs.map((t) => {
        const active = isActive(pathname, t);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors",
              active ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="size-4" aria-hidden="true" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

const primary = ["/research", "/research/log", "/research/week", "/research/problems"];

/** Bottom tab bar on phones, with everything else in a "More" sheet. */
export function ResearchBottomNav({ today, isAdmin, name }: { today: string; isAdmin: boolean; name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const todayHref = `/research/log/${today}`;
  const onToday = pathname === todayHref;
  const main = tabs.filter((t) => primary.includes(t.href));
  const more = tabs.filter((t) => !primary.includes(t.href));
  const moreActive = more.some((t) => isActive(pathname, t));

  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium transition-colors";

  return (
    <nav
      aria-label="Research"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch px-1">
        {main.slice(0, 2).map((t) => (
          <NavItem key={t.href} t={t} active={isActive(pathname, t) && !onToday} className={item} />
        ))}

        {/* Centre action: today's log */}
        <Link href={todayHref} className={item} aria-label="Write today's log">
          <span
            className={cn(
              "-mt-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-background transition-transform active:scale-95",
            )}
          >
            <ClipboardList className="size-5" aria-hidden="true" />
          </span>
          <span className={onToday ? "text-foreground" : "text-muted-foreground"}>Today</span>
        </Link>

        {main.slice(2).map((t) => (
          <NavItem key={t.href} t={t} active={isActive(pathname, t)} className={item} />
        ))}

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className={cn(item, moreActive || open ? "text-foreground" : "text-muted-foreground")}>
            <Menu className={cn("size-5", moreActive && "text-brand")} aria-hidden="true" />
            More
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-card px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
              <div className="mb-2 flex items-center justify-between">
                <Dialog.Title className="truncate font-display text-lg font-semibold">{name}</Dialog.Title>
                <Dialog.Close className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent" aria-label="Close">
                  <X className="size-5" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">More research pages and account options</Dialog.Description>
              <ul className="flex flex-col">
                {more.map((t) => (
                  <li key={t.href}>
                    <SheetLink href={t.href} icon={t.icon} active={isActive(pathname, t)}>
                      {t.label}
                    </SheetLink>
                  </li>
                ))}
                <li>
                  <a href="/research/export" download className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[0.9375rem] hover:bg-accent">
                    <Download className="size-5 text-muted-foreground" aria-hidden="true" /> Export my notes
                  </a>
                </li>
                {isAdmin && (
                  <li>
                    <SheetLink href="/admin" icon={LayoutDashboard}>
                      Admin dashboard
                    </SheetLink>
                  </li>
                )}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                <form action={signOutResearcher}>
                  <button type="submit" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-[0.9375rem] text-destructive hover:bg-accent">
                    <LogOut className="size-5" aria-hidden="true" /> Sign out
                  </button>
                </form>
                <ThemeToggle />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </nav>
  );
}

function NavItem({ t, active, className }: { t: Tab; active: boolean; className: string }) {
  return (
    <Link href={t.href} aria-current={active ? "page" : undefined} className={cn(className, active ? "text-foreground" : "text-muted-foreground")}>
      <t.icon className={cn("size-5", active && "text-brand")} aria-hidden="true" />
      {t.short ?? t.label}
    </Link>
  );
}

function SheetLink({ href, icon: Icon, active, children }: { href: string; icon: LucideIcon; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn("flex min-h-12 items-center gap-3 rounded-xl px-3 text-[0.9375rem] hover:bg-accent", active && "bg-accent font-medium")}
    >
      <Icon className={cn("size-5", active ? "text-brand" : "text-muted-foreground")} aria-hidden="true" />
      {children}
    </Link>
  );
}
