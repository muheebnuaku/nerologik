import type { Metadata } from "next";

import { PostCard } from "@/components/blog/post-card";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/home/cta-band";
import { PageHeader } from "@/components/ui/page-header";
import { getPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practical thinking on software, AI automation and digital growth for businesses in Ghana and across Africa.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [featured, ...rest] = await getPosts();

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Notes on building and growing digital products."
        description="Practical, no-fluff thinking on software, AI automation and marketing, written for founders and teams in Ghana and beyond."
      />

      <section aria-label="Articles" className="section-y">
        <div className="container-page flex flex-col gap-5">
          {featured ? (
            <>
              <Reveal>
                <PostCard post={featured} featured />
              </Reveal>
              <ul className="grid gap-5 md:grid-cols-2">
                {rest.map((post, i) => (
                  <li key={post.slug}>
                    <Reveal delay={i * 0.06} className="h-full">
                      <PostCard post={post} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted-foreground">No articles yet. Check back soon.</p>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
