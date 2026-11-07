import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/work/project-card";
import { getFeaturedProjects } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Desktop layout: two large cards, then three smaller ones. */
function cardSpan(index: number, total: number) {
  if (index < 2) return "lg:col-span-3";
  // Last odd card spans both columns on tablet
  return cn("lg:col-span-2", index === total - 1 && total % 2 === 1 && "sm:col-span-2 lg:col-span-2");
}

export async function WorkShowcase() {
  const projects = await getFeaturedProjects();

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
            <li key={project.slug} className={cardSpan(i, projects.length)}>
              <Reveal delay={(i % 3) * 0.06} className="h-full">
                <ProjectCard project={project} linkTo="live" large={i < 2} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
