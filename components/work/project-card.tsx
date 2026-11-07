import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ChatMockup } from "@/components/work/chat-mockup";
import { displayHost } from "@/components/work/browser-frame";
import type { Project } from "@/lib/content/work";

type ProjectCardProps = {
  project: Project;
  /** "live" opens the product in a new tab; "case-study" goes to /work/[slug] */
  linkTo?: "live" | "case-study";
  large?: boolean;
};

const cardClass =
  "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,transform,box-shadow] duration-(--duration-slow) ease-(--ease-out-expo) hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-black/10";

export function ProjectCard({ project, linkTo = "case-study", large = false }: ProjectCardProps) {
  const isWhatsApp = project.liveUrl.includes("wa.me");
  const footerLabel =
    linkTo === "live" ? (project.liveLabel ?? displayHost(project.liveUrl)) : "Read case study";

  const body = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-muted">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.client} website`}
            fill
            placeholder={typeof project.image === "string" ? "empty" : "blur"}
            sizes={
              large
                ? "(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw"
                : "(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover object-top transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.03]"
          />
        ) : (
          <ChatMockup />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-xl font-semibold tracking-tight">{project.client}</h3>
            <p className="text-sm text-muted-foreground">{project.title}</p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>

        {large && <p className="hidden text-sm leading-relaxed text-muted-foreground sm:block">{project.summary}</p>}

        <ul className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4 text-sm">
          {project.metric ? (
            <span>
              <span className="font-semibold text-brand">{project.metric.value}</span>{" "}
              <span className="text-muted-foreground">{project.metric.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{isWhatsApp ? "Live demo" : "Live"}</span>
          )}
          <span className="shrink-0 font-mono text-xs text-muted-foreground group-hover:text-foreground">
            {footerLabel}
          </span>
        </div>
      </div>
    </>
  );

  if (linkTo === "live") {
    return (
      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
        {body}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={`/work/${project.slug}`} className={cardClass}>
      {body}
    </Link>
  );
}
