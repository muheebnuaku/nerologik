import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { processSteps } from "@/lib/content/home";

export function Process() {
  return (
    <section aria-labelledby="process-heading" className="section-y border-t border-border">
      <div className="container-page flex flex-col gap-8 sm:gap-10">
        <Reveal>
          <SectionHeading
            id="process-heading"
            index="03"
            eyebrow="How we work"
            title="A clear process, from first call to measurable growth."
            description="No black boxes. You see progress every week and own everything we build."
          />
        </Reveal>

        {/* Vertical timeline on mobile, horizontal track on desktop */}
        <ol className="grid gap-6 lg:grid-cols-4 lg:gap-6">
          {processSteps.map((step, i) => (
            <li key={step.title} className="relative pl-16 lg:pl-0 lg:pt-10">
              {i < processSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-10 -bottom-10 left-5 w-px bg-linear-to-b from-brand/50 to-border lg:top-5 lg:-right-6 lg:bottom-auto lg:left-10 lg:h-px lg:w-auto lg:bg-linear-to-r"
                />
              )}
              <span className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-full border border-brand/40 bg-background font-mono text-xs text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>

              <Reveal delay={i * 0.08} className="flex flex-col gap-3">
                <h3 className="text-display-md font-medium">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {step.description}
                </p>
                <ul className="flex flex-wrap gap-2 pt-1" aria-label={`${step.title} deliverables`}>
                  {step.outputs.map((output) => (
                    <li
                      key={output}
                      className="rounded-md bg-secondary px-2.5 py-1 font-mono text-[0.6875rem] text-secondary-foreground"
                    >
                      {output}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
