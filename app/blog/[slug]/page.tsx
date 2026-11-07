import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PostCard } from "@/components/blog/post-card";
import { formatDate, readingTime } from "@/components/blog/post-meta";
import { CtaBand } from "@/components/sections/home/cta-band";
import { Prose } from "@/components/ui/prose";
import { getPostBySlug, getPosts } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", publishedTime: post.publishedAt, title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const more = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output is safe here: all values are our own content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <article>
        <header className="relative isolate -mt-(--spacing-nav) overflow-hidden border-b border-border pt-(--spacing-nav)">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="bg-grid mask-hero absolute inset-0" />
          </div>
          <div className="container-page">
          <div className="flex max-w-3xl flex-col gap-6 pt-6 pb-8 sm:pt-10 sm:pb-10">
            <Link
              href="/blog"
              className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All insights
            </Link>
            <span className="w-fit rounded-md bg-brand-soft px-2 py-1 font-mono text-xs text-brand">
              {post.category}
            </span>
            <h1 className="text-display-xl font-semibold">{post.title}</h1>
            <p className="text-lead text-muted-foreground">{post.excerpt}</p>
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{post.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              {readingTime(post.content)} min read
            </p>
          </div>
          </div>
        </header>

        <div className="container-page py-8 sm:py-12">
          <Prose content={post.content} className="max-w-3xl" />
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-heading" className="border-t border-border py-10 sm:py-12">
          <div className="container-page flex flex-col gap-8">
            <h2 id="more-heading" className="text-display-md font-semibold">
              Keep reading
            </h2>
            <ul className="grid gap-5 md:grid-cols-2">
              {more.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
