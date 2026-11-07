import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { primaryCta, siteConfig } from "@/lib/site-config";

export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="container-page pb-12 sm:pb-16">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 sm:px-12 sm:py-12 lg:px-16">
          <div aria-hidden="true" className="bg-grid mask-hero absolute inset-0 -z-10" />
          <div
            aria-hidden="true"
            className="absolute -bottom-40 left-1/2 -z-10 h-80 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-brand-glow opacity-50 blur-glow"
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-2xl flex-col gap-5">
              <p className="font-mono text-eyebrow uppercase text-brand">Let&apos;s talk</p>
              <h2 id="cta-heading" className="text-display-xl font-semibold">
                Have a project in mind? Let&apos;s build it together.
              </h2>
              <p className="text-lead text-muted-foreground">
                Book a free 30-minute call. We&apos;ll map your goals and tell you honestly
                whether we&apos;re the right fit.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={primaryCta.href}>
                  {primaryCta.title}
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle />
                  WhatsApp us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
