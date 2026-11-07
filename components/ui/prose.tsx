import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-8 mb-4 text-display-md font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="mt-8 mb-3 text-lg font-semibold">{children}</h3>,
  p: ({ children }) => <p className="my-5 leading-relaxed text-foreground/85">{children}</p>,
  // Bullet lists get a brand-coloured dot; ordered lists keep their numbers
  ul: ({ children }) => (
    <ul className="my-5 flex flex-col gap-2.5 pl-1 [&>li]:relative [&>li]:pl-6 [&>li]:leading-relaxed [&>li]:text-foreground/85 [&>li]:before:absolute [&>li]:before:top-[0.7em] [&>li]:before:left-1 [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-brand">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 flex list-decimal flex-col gap-2.5 pl-5 marker:text-brand [&>li]:pl-1 [&>li]:leading-relaxed [&>li]:text-foreground/85">
      {children}
    </ol>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link href={href} className="font-medium text-brand underline underline-offset-4">
        {children}
      </Link>
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-brand underline underline-offset-4"
      >
        {children}
      </a>
    ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-brand pl-5 text-lg italic text-foreground/90">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]">{children}</code>
  ),
};

/** Renders Markdown (local or Supabase content) with the site's typography. */
export function Prose({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("text-base sm:text-[1.0625rem]", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
