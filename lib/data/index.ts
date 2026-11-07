/**
 * Data access layer. Every page reads content through these functions.
 *
 * Content comes from Supabase (published rows only, enforced by RLS). Results
 * are cached and revalidated every 5 minutes, and can be refreshed instantly
 * with revalidateTag(CONTENT_TAG) (the admin dashboard does this on save).
 *
 * If Supabase is unreachable or not configured, we fall back to the bundled
 * content in lib/content so the site never goes blank.
 */

import "server-only";

import type { StaticImageData } from "next/image";
import { cache } from "react";

import { posts as localPosts, type Post } from "@/lib/content/posts";
import type { ServiceSlug } from "@/lib/content/services";
import { projects as localProjects, type Project, type ProjectCategory } from "@/lib/content/work";
import type { Tables } from "@/lib/supabase/database.types";
import { createPublicClient } from "@/lib/supabase/server";

export type { Post, Project };

export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
};

export const CONTENT_TAG = "content";
const REVALIDATE_SECONDS = 300;

/** Public client whose requests go through Next's data cache. */
function db() {
  return createPublicClient((input, init) =>
    fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_TAG] } }),
  );
}

async function withFallback<T>(label: string, query: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(`[data] ${label} failed, using bundled content:`, error instanceof Error ? error.message : error);
    return fallback();
  }
}

// Screenshots bundled with the site keep their blur placeholders; any other
// path or URL (e.g. a Supabase Storage upload) is passed through as a string.
const bundledImages = new Map<string, StaticImageData>(
  localProjects.flatMap((p) => {
    const pairs: [string, StaticImageData][] = [];
    if (p.image && typeof p.image !== "string") pairs.push([`/work/${p.slug}-desktop.png`, p.image]);
    if (p.mobileImage && typeof p.mobileImage !== "string") pairs.push([`/work/${p.slug}-mobile.png`, p.mobileImage]);
    return pairs;
  }),
);

function resolveImage(path: string | null): StaticImageData | string | undefined {
  if (!path) return undefined;
  return bundledImages.get(path) ?? path;
}

function toProject(row: Tables<"case_studies">): Project {
  return {
    slug: row.slug,
    client: row.client,
    title: row.title,
    summary: row.summary,
    content: row.content,
    tags: row.tags,
    categories: row.categories as ProjectCategory[],
    services: row.services as ServiceSlug[],
    metric: row.metric_value && row.metric_label ? { value: row.metric_value, label: row.metric_label } : undefined,
    liveUrl: row.live_url,
    liveLabel: row.live_label ?? undefined,
    image: resolveImage(row.image_url),
    mobileImage: resolveImage(row.mobile_image_url),
    featured: row.featured,
  };
}

function toPost(row: Tables<"posts">): Post {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    author: row.author,
    publishedAt: (row.published_at ?? row.created_at).slice(0, 10),
  };
}

// ── Case studies ─────────────────────────────────────────────────────────────

export const getProjects = cache(async (): Promise<Project[]> =>
  withFallback(
    "getProjects",
    async () => {
      const { data, error } = await db()
        .from("case_studies")
        .select("*")
        .eq("is_published", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(toProject);
    },
    () => localProjects,
  ),
);

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}

// ── Posts ────────────────────────────────────────────────────────────────────

export const getPosts = cache(async (): Promise<Post[]> =>
  withFallback(
    "getPosts",
    async () => {
      const { data, error } = await db()
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data.map(toPost);
    },
    () => [...localPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
  ),
);

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((p) => p.slug === slug);
}

// ── Testimonials ─────────────────────────────────────────────────────────────

export const getTestimonials = cache(async (): Promise<Testimonial[]> =>
  withFallback(
    "getTestimonials",
    async () => {
      const { data, error } = await db()
        .from("testimonials")
        .select("name, role, company, quote")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data.map((t) => ({ name: t.name, role: t.role ?? "", company: t.company ?? "", quote: t.quote }));
    },
    // Bundled testimonials are placeholders: never show them as a fallback.
    () => [],
  ),
);
