import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Clock, LayoutGrid, MessageCircle } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/home/cta-band";
import { Button } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { WorkGrid } from "@/components/work/work-grid";
import { generalFaqs, services, type Service } from "@/lib/content/services";
import { getProjects, type Project } from "@/lib/data";
import { primaryCta } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services, Pricing & Work",
  description:
    "Custom software, web and mobile apps, AI automation and digital marketing for businesses in Ghana and beyond. See live projects, clear starting prices and fixed quotes.",
  alternates: { canonical: "/services" },
};

function ServiceProjects({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-lg font-semibold">Built with this service</h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.slug} className="min-w-0">
            <Link
              href={`/work/${project.slug}`}
              className="group flex h-full items-center gap-3 rounded-xl border border-border bg-card p-2.5 transition-colors hover:border-brand/40"
            >
              <span className="relative flex aspect-[16/10] w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-brand-soft">
                {project.image ? (
                  <Image src={project.image} alt="" fill sizes="96px" className="object-cover object-top" />
                ) : (
                  <MessageCircle className="size-5 text-brand" aria-hidden="true" />
                )}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{project.client}</span>
                <span className="truncate text-xs text-muted-foreground">{project.title}</span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServiceSection({
  service,
  index,
  projects,
}: {
  service: Service;
  index: number;
  projects: Project[];
}) {
  const Icon = service.icon;
  const { pricing } = service;

  return (
    <section
      id={service.slug}
      aria-labelledby={`${service.slug}-heading`}
      className="section-y border-b border-border"
    >
      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left: overview */}
        <Reveal className="flex flex-col gap-8 lg:col-span-7">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="font-mono text-eyebrow uppercase text-muted-foreground">
                Service {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h2 id={`${service.slug}-heading`} className="text-display-lg font-semibold">
              {service.title}
            </h2>
            <p className="max-w-2xl text-lead text-muted-foreground">{service.summary}</p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-3">
            {service.benefits.map((benefit) => (
              <li key={benefit.title} className="flex flex-col gap-2 rounded-xl border border-border p-5">
                <Check className="size-5 text-brand" aria-hidden="true" />
                <h3 className="font-medium">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </li>
            ))}
          </ul>

          {projects.length > 0 && <ServiceProjects projects={projects} />}

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-lg font-semibold">Common questions</h3>
            <FaqList items={service.faqs} />
          </div>
        </Reveal>

        {/* Right: pricing card (sticky on desktop) */}
        <div className="lg:col-span-5">
          <Reveal
            delay={0.08}
            className={cn(
              "flex flex-col gap-6 rounded-xl border bg-card p-6 sm:p-8 lg:sticky lg:top-24",
              pricing.popular ? "border-primary ring-1 ring-primary" : "border-border",
            )}
          >
            {pricing.popular && (
              <span className="w-fit rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                Most requested
              </span>
            )}
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Starting from</p>
              <p className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold tracking-tight">{pricing.from}</span>
                {pricing.unit && <span className="text-muted-foreground">{pricing.unit}</span>}
              </p>
              {pricing.note && <p className="text-sm text-muted-foreground">{pricing.note}</p>}
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" aria-hidden="true" />
                {pricing.timeline}
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-6">
              <h3 className="text-sm font-medium">What&apos;s included</h3>
              <ul className="flex flex-col gap-2.5 text-sm">
                {pricing.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="flex flex-wrap gap-1.5">
              {service.tags.map((tag) => (
                <li key={tag} className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                  {tag}
                </li>
              ))}
            </ul>

            <Button asChild size="lg" variant={pricing.popular ? "default" : "outline"} className="w-full">
              <Link href={`${primaryCta.href}?service=${service.slug}`}>
                Get a quote <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default async function ServicesPage() {
  const projects = await getProjects();
  const projectsFor = (slug: Service["slug"]) => projects.filter((p) => p.services.includes(slug));

  const chipClass =
    "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background/60 px-3.5 text-sm font-medium transition-colors hover:border-brand/40 hover:text-brand";

  return (
    <>
      <PageHeader
        eyebrow="Services & work"
        title="What we do, what it costs, and what we've shipped."
        description="Four services, one team, and real products you can try today. Every project starts with a free call and a fixed quote."
      >
        <nav aria-label="On this page" className="flex flex-wrap gap-2 pt-2">
          <Link href="#work" className={chipClass}>
            <LayoutGrid className="size-4 text-brand" aria-hidden="true" />
            Our work
          </Link>
          {services.map((service) => (
            <Link key={service.slug} href={`#${service.slug}`} className={chipClass}>
              <service.icon className="size-4 text-brand" aria-hidden="true" />
              {service.title}
            </Link>
          ))}
        </nav>
      </PageHeader>

      <section id="work" aria-labelledby="work-heading" className="section-y border-b border-border">
        <div className="container-page flex flex-col gap-6 sm:gap-8">
          <SectionHeading
            id="work-heading"
            eyebrow="Our work"
            title="Live products, used by real people."
            description="Filter by service. Open any project for the full story, or visit the live product."
          />
          <WorkGrid projects={projects} />
        </div>
      </section>

      {services.map((service, i) => (
        <ServiceSection key={service.slug} service={service} index={i} projects={projectsFor(service.slug)} />
      ))}

      <section aria-labelledby="general-faq-heading" className="section-y">
        <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-4">
            <p className="font-mono text-eyebrow uppercase text-brand">FAQ</p>
            <h2 id="general-faq-heading" className="text-display-lg font-semibold">
              Working with us
            </h2>
            <p className="text-muted-foreground">
              Can&apos;t find your answer?{" "}
              <Link href="/contact" className="font-medium text-foreground underline underline-offset-4 hover:text-brand">
                Ask us directly
              </Link>
              .
            </p>
          </div>
          <FaqList items={generalFaqs} className="lg:col-span-8" />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
