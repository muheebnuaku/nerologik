"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ProjectCard } from "@/components/work/project-card";
import { services, type ServiceSlug } from "@/lib/content/services";
import type { Project } from "@/lib/content/work";
import { cn } from "@/lib/utils";

type Filter = ServiceSlug | "all";

/** Case-study grid filtered by service. Services with no projects are hidden. */
export function WorkGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const matches = (p: Project, f: Filter) => f === "all" || p.services.includes(f);
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All work" },
    ...services.filter((s) => projects.some((p) => matches(p, s.slug))).map((s) => ({ id: s.slug, label: s.title })),
  ];
  const visible = projects.filter((p) => matches(p, filter));

  // 6-column grid on desktop: cards normally take a third, but the first few
  // widen to halves so the last row is never left with an empty slot.
  const remainder = visible.length % 3;
  const wideCount = remainder === 2 ? 2 : remainder === 1 && visible.length >= 4 ? 4 : 0;

  return (
    <div className="flex flex-col gap-8">
      <div
        role="group"
        aria-label="Filter projects"
        className="scrollbar-none -mx-(--spacing-gutter) flex gap-2 overflow-x-auto px-(--spacing-gutter) md:mx-0 md:flex-wrap md:px-0"
      >
        {filters.map((f) => {
          const count = projects.filter((p) => matches(p, f.id)).length;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {f.label}
              <span className={cn("font-mono text-xs", active ? "opacity-80" : "opacity-60")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>

      <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <AnimatePresence mode="popLayout">
          {visible.map((project, i) => (
            <motion.li
              key={project.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={i < wideCount ? "lg:col-span-3" : "lg:col-span-2"}
            >
              <ProjectCard project={project} large={i < wideCount} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
