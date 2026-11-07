import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/work/project-card";
import { getFeaturedProjects } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Desktop layout on a 6-column grid: wide cards (3 cols) first, then rows of
 * three (2 cols each). The wide count keeps every row full.
 */
function wideCount(total: number) {
  const remainder = total % 3;
  return remainder === 2 ? 2 : remainder === 1 && total >= 4 ? 4 : 0;
}

function cardSpan(index: number, total: number, wide: number) {
  if (index < wide) return "lg:col-span-3";
  // Last odd card spans both columns on tablet
  return cn("lg:col-span-2", index === total - 1 && total % 2 === 1 && "sm:col-span-2");
}

export async function WorkShowcase() {
  const projects = await getFeaturedProjects();
  const wide = wideCount(projects.length);

  return (
    <section id="work" aria-labelledby="work-heading" className="section-y border-t border-border">
      <div className="container-page flex flex-col gap-8">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="work-heading"
            index="01"
            eyebrow="Shipped by our team"
            title="Real products, live in production."
            description="Click any project to see it live."
          />
          <Button asChild variant="outline" className="w-fit shrink-0">
            <Link href="/services#work">
              All case studies <ArrowRight />
            </Link>
          </Button>
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {projects.map((project, i) => (
            <li key={project.slug} className={cardSpan(i, projects.length, wide)}>
              <Reveal delay={(i % 3) * 0.06} className="h-full">
                <ProjectCard project={project} linkTo="live" large={i < wide} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
