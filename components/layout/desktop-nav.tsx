"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

import { services } from "@/lib/content/services";
import { mainNav, primaryCta } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const SERVICES_HREF = "/services";

const itemClass =
  "relative flex h-9 items-center gap-1 rounded-lg px-3.5 text-sm font-medium outline-none transition-colors duration-(--duration-base) focus-visible:outline-2 focus-visible:outline-ring";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Pill that slides between items; rests on the active page when nothing is hovered. */
function Highlight() {
  return (
    <motion.span
      layoutId="nav-highlight"
      aria-hidden="true"
      className="absolute inset-0 -z-10 rounded-lg bg-accent"
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
    />
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  // Dropdown links aren't on screen until it opens, so Next can't prefetch
  // them automatically. Do it up front so clicks feel instant.
  useEffect(() => {
    router.prefetch(SERVICES_HREF);
    router.prefetch(primaryCta.href);
  }, [router]);
  const activeHref = mainNav.find((item) => isActivePath(pathname, item.href))?.href ?? null;
  const highlighted = hovered ?? activeHref;

  return (
    <NavigationMenu.Root
      aria-label="Main"
      delayDuration={60}
      className="relative hidden lg:block"
      onMouseLeave={() => setHovered(null)}
    >
      <NavigationMenu.List className="flex items-center">
        {mainNav.map((item) => {
          const active = item.href === activeHref;
          const textClass = active || highlighted === item.href ? "text-foreground" : "text-muted-foreground";

          if (item.href === SERVICES_HREF) {
            return (
              <NavigationMenu.Item key={item.href} onMouseEnter={() => setHovered(item.href)}>
                <NavigationMenu.Trigger
                  className={cn(itemClass, "group isolate", textClass)}
                  onFocus={() => setHovered(item.href)}
                  onClick={(event) => {
                    // Mouse/touch click goes to the Services page (hover already shows the menu).
                    // Keyboard activation (detail === 0) keeps toggling the menu.
                    if (event.detail === 0) return;
                    event.preventDefault();
                    router.push(SERVICES_HREF);
                  }}
                >
                  {highlighted === item.href && <Highlight />}
                  {item.title}
                  <ChevronDown
                    aria-hidden="true"
                    className="size-3.5 opacity-70 transition-transform duration-(--duration-slow) ease-(--ease-out-expo) group-data-[state=open]:rotate-180"
                  />
                </NavigationMenu.Trigger>

                <NavigationMenu.Content className="w-[38rem] p-3 data-[motion=from-start]:animate-in data-[motion=from-start]:fade-in data-[motion=from-end]:animate-in data-[motion=from-end]:fade-in">
                  <div className="grid grid-cols-[1fr_13rem] gap-3">
                    <ul className="grid grid-cols-1 gap-1">
                      {services.map((service) => {
                        const Icon = service.icon;
                        return (
                          <li key={service.slug}>
                            <NavigationMenu.Link asChild>
                              <Link
                                href={`${SERVICES_HREF}#${service.slug}`}
                                className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-accent focus-visible:bg-accent"
                              >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand transition-colors group-hover/item:bg-primary group-hover/item:text-primary-foreground">
                                  <Icon className="size-4" aria-hidden="true" />
                                </span>
                                <span className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium text-foreground">
                                    {service.title}
                                  </span>
                                  <span className="text-xs leading-relaxed text-muted-foreground">
                                    {service.tagline}
                                  </span>
                                </span>
                              </Link>
                            </NavigationMenu.Link>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Promo panel */}
                    <div className="relative isolate flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-background/60 p-4">
                      <div
                        aria-hidden="true"
                        className="absolute -top-16 -right-16 -z-10 size-40 rounded-full bg-brand-glow blur-3xl"
                      />
                      <div className="flex flex-col gap-2">
                        <p className="font-mono text-eyebrow uppercase text-brand">Not sure?</p>
                        <p className="font-display text-base font-medium leading-snug">
                          Tell us the problem. We&apos;ll suggest the right mix.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 pt-6">
                        <NavigationMenu.Link asChild>
                          <Link
                            href={primaryCta.href}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            {primaryCta.title}
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                          </Link>
                        </NavigationMenu.Link>
                        <NavigationMenu.Link asChild>
                          <Link
                            href={SERVICES_HREF}
                            className="inline-flex h-9 items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            Services & work
                          </Link>
                        </NavigationMenu.Link>
                      </div>
                    </div>
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            );
          }

          return (
            <NavigationMenu.Item key={item.href} onMouseEnter={() => setHovered(item.href)}>
              <NavigationMenu.Link asChild active={active}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onFocus={() => setHovered(item.href)}
                  onBlur={() => setHovered(null)}
                  className={cn(itemClass, "isolate", textClass)}
                >
                  {highlighted === item.href && <Highlight />}
                  {item.title}
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>

      {/* Dropdown panel, centred under the nav */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4">
        <NavigationMenu.Viewport className="relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) origin-top overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-nav backdrop-blur-xl transition-[width,height] duration-(--duration-slow) ease-(--ease-out-expo) data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95" />
      </div>
    </NavigationMenu.Root>
  );
}
