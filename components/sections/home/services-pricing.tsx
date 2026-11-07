import Link from "next/link";
import { Check, Clock } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { services, type Service } from "@/lib/content/services";
import { primaryCta } from "@/lib/site-config";
import { cn } from "@/lib/utils";

function PriceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  const { pricing } = service;

  return (
    <article
      id={service.slug}
      className={cn(
        "relative flex h-full flex-col gap-6 rounded-xl border bg-card p-6 sm:p-7",
        pricing.popular ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      {pricing.popular && (
        <span className="absolute -top-3 left-6 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
          Most requested
        </span>
      )}

      <div className="flex flex-col gap-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h3 className="font-display text-xl font-semibold tracking-tight">{service.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-y border-border py-5">
        <p className="text-xs text-muted-foreground">Starting from</p>
        <p className="flex items-baseline gap-1">
          <span className="font-display text-3xl font-semibold tracking-tight">{pricing.from}</span>
          {pricing.unit && <span className="text-sm text-muted-foreground">{pricing.unit}</span>}
        </p>
        {pricing.note && <p className="text-xs text-muted-foreground">{pricing.note}</p>}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          {pricing.timeline}
        </p>
      </div>

      <ul className="flex flex-col gap-2.5 text-sm">
        {pricing.includes.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      <Button asChild variant={pricing.popular ? "default" : "outline"} className="mt-auto w-full">
        <Link href={`${primaryCta.href}?service=${service.slug}`}>
          Get a quote<span className="sr-only"> for {service.title}</span>
        </Link>
      </Button>
    </article>
  );
}

export function ServicesPricing() {
  return (
    <section id="services" aria-labelledby="services-heading" className="section-y border-t border-border">
      <div className="container-page flex flex-col gap-8">
        <Reveal>
          <SectionHeading
            id="services-heading"
            index="02"
            eyebrow="Services & pricing"
            title="Clear prices. No surprises."
            description="Every project starts with a free call and a fixed quote. Prices below are starting points; your final quote depends on scope."
          />
        </Reveal>

        <ul className="grid gap-5 pt-3 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service, i) => (
            <li key={service.slug}>
              <Reveal delay={i * 0.06} className="h-full">
                <PriceCard service={service} />
              </Reveal>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground">
          International clients: we also quote in USD.{" "}
          <Link href={primaryCta.href} className="font-medium text-foreground underline underline-offset-4 hover:text-brand">
            Ask for a custom quote
          </Link>
        </p>
      </div>
    </section>
  );
}
