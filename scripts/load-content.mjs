/** Loads lib/content/*.ts in plain Node (resolves "@/..." and image imports). */
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const loader = `
const root = ${JSON.stringify(pathToFileURL(root + "/").href)};
export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const target = specifier.slice(2);
    const withExt = /\.(png|jpe?g|webp|svg)$/.test(target) ? target : target + ".ts";
    return next(new URL(withExt, root).href, context);
  }
  return next(specifier, context);
}
export async function load(url, context, next) {
  if (/\.(png|jpe?g|webp|svg)$/.test(url)) {
    const publicPath = "/" + url.slice(url.indexOf("/public/") + 8);
    return { format: "module", shortCircuit: true, source: "export default { src: " + JSON.stringify(publicPath) + " };" };
  }
  return next(url, context);
}`;
register("data:text/javascript," + encodeURIComponent(loader));

const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
export const { projects } = await imp("lib/content/work.ts");
export const { posts } = await imp("lib/content/posts.ts");
export const { testimonials } = await imp("lib/content/home.ts");

/** Content → table rows. Shared by seed.sql generation and the direct seeder. */
export const caseStudyRows = projects.map((p, i) => ({
  slug: p.slug, client: p.client, title: p.title, summary: p.summary, content: p.content,
  tags: p.tags, categories: p.categories, services: p.services,
  metric_value: p.metric?.value ?? null, metric_label: p.metric?.label ?? null,
  live_url: p.liveUrl, live_label: p.liveLabel ?? null,
  image_url: p.image?.src ?? null, mobile_image_url: p.mobileImage?.src ?? null,
  featured: p.featured, sort_order: i, is_published: true, published_at: new Date().toISOString(),
}));
export const postRows = posts.map((p) => ({
  slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content, category: p.category,
  author: p.author, is_published: true, published_at: new Date(p.publishedAt).toISOString(),
}));
// PLACEHOLDER testimonials are seeded unpublished so invented quotes never go live.
export const testimonialRows = testimonials.map((t, i) => ({
  name: t.name, role: t.role, company: t.company, quote: t.quote, sort_order: i, is_published: false,
}));
