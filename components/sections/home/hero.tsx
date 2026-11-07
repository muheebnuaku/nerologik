import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { NodeNetwork } from "@/components/effects/node-network";
import { Button } from "@/components/ui/button";
import { BrowserFrame, PhoneFrame } from "@/components/work/browser-frame";
import { primaryCta } from "@/lib/site-config";
import elsasuMobile from "@/public/work/elsasu-rentals-mobile.png";
import hustleclickDesktop from "@/public/work/hustleclickgh-desktop.png";

const TRUST_POINTS = ["Reply within 24h", "Fixed-scope pricing", "Pay with MoMo or card"];

/** Real product screenshots in a browser + phone frame. */
function DeviceShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-xl pb-6 pl-6 sm:pl-10 lg:max-w-none">
      <BrowserFrame url="hustleclickgh.com">
        <Image
          src={hustleclickDesktop}
          alt="HustleClickGH, an AI dataset platform built by Nerologik"
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 560px, 90vw"
          className="h-auto w-full"
        />
      </BrowserFrame>

      <PhoneFrame className="absolute bottom-0 left-0 w-[28%] max-w-40">
        <Image
          src={elsasuMobile}
          alt="Elsasu Rentals mobile booking site built by Nerologik"
          fill
          sizes="160px"
          className="object-cover object-top"
        />
      </PhoneFrame>

      <div className="absolute -top-4 right-3 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:right-6">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-brand" />
        </span>
        5 products live
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      // Pull the background up underneath the floating nav
      className="relative isolate -mt-(--spacing-nav) overflow-hidden pt-(--spacing-nav)"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-grid mask-hero absolute inset-0" />
        <NodeNetwork className="mask-hero absolute inset-0 opacity-50" />
        <div className="absolute -top-56 right-[-10%] size-128 rounded-full bg-brand-glow opacity-60 blur-glow" />
      </div>

      <div className="container-page grid items-center gap-8 pt-6 pb-10 sm:pt-10 sm:pb-14 lg:grid-cols-2 lg:gap-8 lg:pt-12 lg:pb-16">
        <div className="flex flex-col items-start gap-6 sm:gap-7">
          <h1 id="hero-heading" className="text-display-2xl font-semibold lg:text-display-xl">
            We build software that <span className="text-brand">grows</span> your business.
          </h1>

          <p className="max-w-xl text-lead text-muted-foreground">
            Nerologik designs, builds and markets custom software, apps and AI automation for
            SMEs, startups and NGOs in Ghana and beyond.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={primaryCta.href}>
                {primaryCta.title}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="#work">See our work</Link>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <Check className="size-4 text-brand" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <DeviceShowcase />
      </div>
    </section>
  );
}
