import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/** Accessible accordion built on native <details>; works without JavaScript. */
export function FaqList({
  items,
  className,
}: {
  items: { question: string; answer: string }[];
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-medium transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
            {item.question}
            <Plus
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--duration-base) group-open:rotate-45"
            />
          </summary>
          <p className="pr-10 pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
