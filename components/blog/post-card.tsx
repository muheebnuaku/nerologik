import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { formatDate, readingTime } from "@/components/blog/post-meta";
import type { Post } from "@/lib/content/posts";
import { cn } from "@/lib/utils";

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group relative isolate flex h-full flex-col justify-between gap-8 overflow-hidden rounded-xl border border-border bg-card p-6 transition-[border-color,transform] duration-(--duration-slow) ease-(--ease-out-expo) hover:-translate-y-1 hover:border-brand/40 sm:p-8",
        featured && "lg:min-h-96",
      )}
    >
      {featured && (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="bg-grid absolute inset-0 opacity-70 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div className="absolute -top-24 -right-24 size-80 rounded-full bg-brand-glow opacity-60 blur-3xl" />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-md bg-brand-soft px-2 py-1 font-mono text-xs text-brand">{post.category}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
          />
        </div>
        <h3 className={cn("font-display font-semibold tracking-tight", featured ? "text-display-lg max-w-2xl" : "text-xl")}>
          {post.title}
        </h3>
        <p className={cn("leading-relaxed text-muted-foreground", featured ? "max-w-2xl sm:text-lg" : "text-sm")}>
          {post.excerpt}
        </p>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden="true">·</span>
        {readingTime(post.content)} min read
      </p>
    </Link>
  );
}
