import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

import { CtaBand } from "@/components/sections/home/cta-band";
import { Button } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { BrowserFrame, PhoneFrame, displayHost } from "@/components/work/browser-frame";
import { ChatMockup } from "@/components/work/chat-mockup";
import { services } from "@/lib/content/services";
import { getProjectBySlug, getProjects } from "@/lib/data";
import { primaryCta } from "@/lib/site-config";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.client}: ${project.title}`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  const projectServices = services.filter((s) => project.services.includes(s.slug));
  const isWhatsApp = project.liveUrl.includes("wa.me");
  const liveLabel = project.liveLabel ?? "Visit live site";

  return (
    <>
      {/* Header */}
      <section className="relative isolate -mt-(--spacing-nav) overflow-hidden pt-(--spacing-nav)">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="bg-grid mask-hero absolute inset-0" />
          <div className="absolute -top-48 right-[-10%] size-112 rounded-full bg-brand-glow opacity-50 blur-glow" />
        </div>
        <div className="container-page flex flex-col gap-6 pt-6 pb-8 sm:pt-10">
          <Link
            href="/services#work"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All work
          </Link>
          <p className="font-mono text-eyebrow uppercase text-brand">{project.client}</p>
          <h1 className="max-w-4xl text-display-xl font-semibold">{project.title}</h1>
          <p className="max-w-2xl text-lead text-muted-foreground">{project.summary}</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                {liveLabel}
                <ExternalLink />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href={primaryCta.href}>Start a similar project</Link>
            </Button>
          </div>
        </div>

        {/* Screens */}
        <div className="container-page pb-10 sm:pb-14">
          <div className="relative pr-0 sm:pr-16 lg:pr-28">
            <BrowserFrame url={isWhatsApp ? "WhatsApp · AI Assistant" : displayHost(project.liveUrl)}>
              {project.image ? (
                <Image
                  src={project.image}
                  alt={`${project.client} desktop website`}
                  priority
                  placeholder={typeof project.image === "string" ? "empty" : "blur"}
                  {...(typeof project.image === "string" && { width: 1440, height: 900 })}
                  sizes="(min-width: 1280px) 1100px, 92vw"
                  className="h-auto w-full"
                />
              ) : (
                <div className="aspect-[16/9]">
                  <ChatMockup />
                </div>
              )}
            </BrowserFrame>
            {project.mobileImage && (
              <PhoneFrame className="absolute right-0 -bottom-10 hidden w-36 sm:block lg:w-52">
                <Image
                  src={project.mobileImage}
                  alt={`${project.client} on mobile`}
                  fill
                  sizes="208px"
                  className="object-cover object-top"
                />
              </PhoneFrame>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="border-t border-border pb-12 sm:pb-16">
        <div className="container-page grid gap-8 pt-10 lg:grid-cols-12 lg:gap-10">
          <aside className="lg:order-2 lg:col-span-4">
            <dl className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card lg:sticky lg:top-24">
              <div className="flex flex-col gap-1 p-5">
                <dt className="text-xs text-muted-foreground">Client</dt>
                <dd className="font-medium">{project.client}</dd>
              </div>
              {project.metric && (
                <div className="flex flex-col gap-1 p-5">
                  <dt className="text-xs text-muted-foreground">Highlight</dt>
                  <dd>
                    <span className="font-display text-2xl font-semibold text-brand">{project.metric.value}</span>{" "}
                    <span className="text-sm text-muted-foreground">{project.metric.label}</span>
                  </dd>
                </div>
              )}
              <div className="flex flex-col gap-2 p-5">
                <dt className="text-xs text-muted-foreground">Services</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {projectServices.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services#${s.slug}`}
                      className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground transition-colors hover:text-brand"
                    >
                      {s.title}
                    </Link>
                  ))}
                </dd>
              </div>
              <div className="flex flex-col gap-2 p-5">
                <dt className="text-xs text-muted-foreground">Tags</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-border px-2 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="flex flex-col gap-1 p-5">
                <dt className="text-xs text-muted-foreground">Live</dt>
                <dd>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-sm text-brand underline-offset-4 hover:underline"
                  >
                    {isWhatsApp ? "027 000 0004" : displayHost(project.liveUrl)}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </dl>
          </aside>

          <article className="lg:order-1 lg:col-span-8">
            <Prose content={project.content} />
          </article>
        </div>

        {/* Next project */}
        {next && next.slug !== project.slug && (
          <div className="container-page pt-10">
            <Link
              href={`/work/${next.slug}`}
              className="group flex items-center justify-between gap-6 rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/40 sm:p-8"
            >
              <span className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Next project</span>
                <span className="font-display text-display-md font-semibold">{next.client}</span>
                <span className="text-sm text-muted-foreground">{next.title}</span>
              </span>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRight className="size-5" aria-hidden="true" />
              </span>
            </Link>
          </div>
        )}
      </section>

      <CtaBand />
    </>
  );
}
