/**
 * Seeds Supabase directly from lib/content using the server secret key.
 *   node --env-file=.env.local scripts/seed-db.mjs
 * Re-runnable: case studies and posts upsert by slug; testimonials are replaced.
 */
import { createClient } from "@supabase/supabase-js";
import { caseStudyRows, postRows, testimonialRows } from "./load-content.mjs";

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SECRET_KEY: key } = process.env;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
const db = createClient(url, key, { auth: { persistSession: false } });

const check = ({ error }, what) => { if (error) throw new Error(`${what}: ${error.message}`); };

check(await db.from("case_studies").upsert(caseStudyRows, { onConflict: "slug" }), "case_studies");
check(await db.from("posts").upsert(postRows, { onConflict: "slug" }), "posts");
check(await db.from("testimonials").delete().not("id", "is", null), "testimonials (clear)");
check(await db.from("testimonials").insert(testimonialRows), "testimonials");

console.log(`Seeded ${caseStudyRows.length} case studies, ${postRows.length} posts, ${testimonialRows.length} testimonials (unpublished).`);
