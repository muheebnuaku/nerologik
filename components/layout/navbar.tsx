"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { primaryCta, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 12;

/** Floating glass pill. Transparent at the top of the page, solid once scrolled. */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-2xl border pr-2 pl-4 transition-[background-color,border-color,box-shadow] duration-(--duration-slow) ease-(--ease-out-expo)",
          scrolled
            ? "border-glass-border bg-background/70 shadow-nav backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-transparent",
        )}
      >
        <Link href="/" aria-label={`${siteConfig.name} home`} className="shrink-0 rounded-md">
          <Logo />
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button asChild size="sm" className="group hidden sm:inline-flex">
            <Link href={primaryCta.href}>
              {primaryCta.title}
              <ArrowRight className="transition-transform duration-(--duration-base) group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
