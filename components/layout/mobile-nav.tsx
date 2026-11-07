"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Mail, MessageCircle } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { useIsActive } from "@/components/layout/nav-link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/content/services";
import { mainNav, primaryCta, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const STAGGER_S = 0.05;

/** Two-line icon that morphs into an X. */
function MenuIcon({ open }: { open: boolean }) {
  const line =
    "absolute left-1/2 h-[1.5px] w-5 -translate-x-1/2 rounded-full bg-current transition-transform duration-(--duration-slow) ease-(--ease-out-expo)";
  return (
    <span aria-hidden="true" className="relative block size-5">
      <span className={cn(line, "top-[7px]", open && "translate-y-[3px] rotate-45")} />
      <span className={cn(line, "top-[13px]", open && "-translate-y-[3px] -rotate-45")} />
    </span>
  );
}

function MobileLink({
  href,
  title,
  index,
  onNavigate,
}: {
  href: string;
  title: string;
  index: number;
  onNavigate: () => void;
}) {
  const active = useIsActive(href);
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.08 + index * STAGGER_S }}
      className="border-b border-border"
    >
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className="group flex items-baseline gap-4 py-4"
      >
        <span className="font-mono text-xs text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "font-display text-display-lg font-semibold transition-colors",
            active ? "text-gradient-brand" : "text-foreground group-hover:text-brand",
          )}
        >
          {title}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="ml-auto size-5 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </motion.li>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const router = useRouter();
  const pendingHref = useRef<string | null>(null);

  /**
   * Links to a section (/services#x) must wait until the menu has closed:
   * while it's open the page is scroll-locked and the jump lands in the wrong place.
   */
  const closeThenGo = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    pendingHref.current = href;
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <MenuIcon open={false} />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            const href = pendingHref.current;
            if (!href) return;
            event.preventDefault();
            pendingHref.current = null;
            // Next frame: scroll lock has been removed by now.
            requestAnimationFrame(() => router.push(href));
          }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background/97 backdrop-blur-2xl data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 lg:hidden"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>

          {/* Background accents */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
            <div className="bg-grid mask-hero absolute inset-0" />
            <div className="absolute -top-32 -right-24 size-96 rounded-full bg-brand-glow opacity-60 blur-glow" />
          </div>

          {/* Top bar mirrors the floating nav so the X sits where the burger was */}
          <div className="px-3 pt-3 sm:px-4">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pr-2 pl-4">
              <Link href="/" onClick={close} aria-label={`${siteConfig.name} home`} className="rounded-md">
                <Logo />
              </Link>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon" aria-label="Close menu">
                    <MenuIcon open />
                  </Button>
                </Dialog.Close>
              </div>
            </div>
          </div>

          <div className="container-page flex flex-1 flex-col gap-6 pt-6 pb-6">
            <nav aria-label="Mobile">
              <ul className="flex flex-col border-t border-border">
                {mainNav.map((item, i) => (
                  <MobileLink key={item.href} {...item} index={i} onNavigate={close} />
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.08 + mainNav.length * STAGGER_S }}
              className="flex flex-col gap-3"
            >
              <p className="font-mono text-eyebrow uppercase text-muted-foreground">Services</p>
              <ul className="grid grid-cols-2 gap-2">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <li key={service.slug}>
                      <Link
                        href={`/services#${service.slug}`}
                        onClick={(event) => closeThenGo(event, `/services#${service.slug}`)}
                        className="glass flex h-full items-center gap-2.5 rounded-xl p-3 text-sm font-medium transition-colors hover:border-brand/40"
                      >
                        <Icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
                        {service.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.16 + mainNav.length * STAGGER_S }}
              className="mt-auto flex flex-col gap-3"
            >
              <Button asChild size="lg">
                <Link href={primaryCta.href} onClick={close}>
                  {primaryCta.title}
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle />
                  Chat on WhatsApp
                </a>
              </Button>
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-2 flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                {siteConfig.email}
              </a>
            </motion.div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
