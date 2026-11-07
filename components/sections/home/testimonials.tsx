import { Quote } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getTestimonials } from "@/lib/data";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export async function Testimonials() {
  const testimonials = await getTestimonials();
  // Hidden until real, published testimonials exist.
  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-heading" className="section-y">
      <div className="container-page flex flex-col gap-8 sm:gap-10">
        <Reveal>
          <SectionHeading
            id="testimonials-heading"
            index="04"
            eyebrow="Testimonials"
            title="Trusted by founders, operators and changemakers."
          />
        </Reveal>

        {/* Swipeable on phones, a 3-column grid from tablet up */}
        <Reveal>
          <div
            role="region"
            aria-label="Client testimonials"
            tabIndex={0}
            className="scrollbar-none -mx-(--spacing-gutter) snap-x snap-mandatory scroll-px-(--spacing-gutter) overflow-x-auto px-(--spacing-gutter) pb-2 md:mx-0 md:overflow-visible md:px-0 md:pb-0"
          >
          <ul className="flex gap-4 md:grid md:grid-cols-3">
            {testimonials.map((t) => (
              <li
                key={t.name}
                className="w-[85%] shrink-0 snap-start sm:w-[60%] md:w-auto"
              >
                <figure className="glass flex h-full flex-col justify-between gap-8 rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-col gap-5">
                    <Quote className="size-6 text-brand" aria-hidden="true" />
                    <blockquote className="leading-relaxed text-foreground/90">
                      <p>“{t.quote}”</p>
                    </blockquote>
                  </div>
                  <figcaption className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-xs font-medium text-brand"
                    >
                      {initials(t.name)}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.role}, {t.company}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
