import type { Metadata } from "next";
import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/home/cta-band";
import { Stats } from "@/components/sections/home/stats";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { BrowserFrame } from "@/components/work/browser-frame";
import { founders, mission, story, values } from "@/lib/content/about";
import nyansaDesktop from "@/public/work/nyansa-ai-desktop.png";
import pastcsDesktop from "@/public/work/pastcs-desktop.png";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Nerologik is a product engineering and growth studio in Accra, Ghana. One team for software, AI and marketing, led by an engineer and a marketer.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Nerologik"
        title={
          <>
            Neural thinking. <span className="text-brand">Logical execution.</span>
          </>
        }
        description="We're a product engineering and growth studio from Accra, building software, AI and marketing that moves the numbers for ambitious businesses."
      />

      {/* Story */}
      <section aria-labelledby="story-heading" className="section-y">
        <div className="container-page grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <Reveal className="flex flex-col gap-6">
            <SectionHeading id="story-heading" eyebrow="Our story" title="Why we built one team, not two." />
            <div className="flex flex-col gap-5 text-muted-foreground sm:text-lg">
              {story.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08} className="relative pb-10 sm:pr-10 sm:pb-12">
            <BrowserFrame url="nyansaai.com">
              <Image
                src={nyansaDesktop}
                alt="Nyansa AI, built by Nerologik"
                placeholder="blur"
                sizes="(min-width: 1024px) 520px, 90vw"
                className="h-auto w-full"
              />
            </BrowserFrame>
            <BrowserFrame url="pastcs.com" className="absolute right-0 bottom-0 w-3/5">
              <Image
                src={pastcsDesktop}
                alt="PastCS, built by Nerologik"
                placeholder="blur"
                sizes="(min-width: 1024px) 320px, 55vw"
                className="h-auto w-full"
              />
            </BrowserFrame>
          </Reveal>
        </div>
      </section>

      <Stats />

      {/* Mission */}
      <section aria-labelledby="mission-heading" className="section-y">
        <Reveal className="container-page flex flex-col items-start gap-6">
          <p id="mission-heading" className="font-mono text-eyebrow uppercase text-brand">
            Our mission
          </p>
          <p className="max-w-5xl font-display text-display-lg font-semibold">{mission}</p>
        </Reveal>
      </section>

      {/* Founders */}
      <section aria-labelledby="founders-heading" className="section-y border-t border-border">
        <div className="container-page flex flex-col gap-8">
          <Reveal>
            <SectionHeading
              id="founders-heading"
              eyebrow="The founders"
              title="An engineer and a marketer."
              description="Every project gets both perspectives from the very first call."
            />
          </Reveal>
          <ul className="grid gap-5 md:grid-cols-2">
            {founders.map((founder, i) => (
              <li key={founder.role}>
                <Reveal delay={i * 0.08} className="flex h-full flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:p-8">
                  <span
                    aria-hidden="true"
                    className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-brand-soft font-display text-2xl font-semibold text-brand"
                  >
                    {founder.initials}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-xl font-semibold">{founder.name}</h3>
                    <p className="text-sm font-medium text-brand">{founder.role}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{founder.bio}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values-heading" className="section-y border-t border-border">
        <div className="container-page flex flex-col gap-8">
          <Reveal>
            <SectionHeading id="values-heading" eyebrow="Our values" title="How we work, every time." />
          </Reveal>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <li key={value.title}>
                <Reveal delay={i * 0.06} className="flex h-full flex-col gap-4 rounded-xl border border-border p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <value.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-semibold">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
