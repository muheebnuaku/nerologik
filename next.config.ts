import path from "node:path";
import type { NextConfig } from "next";

// Pin the project root. A stray package-lock.json in the user's home folder
// otherwise makes Next.js treat C:\Users\USER as the workspace root.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Lets a production build run alongside `next dev` (e.g. NEXT_DIST_DIR=.next-prod).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  async redirects() {
    // Work was merged into the Services page.
    return [{ source: "/work", destination: "/services#work", permanent: true }];
  },
  images: {
    // Images uploaded to Supabase Storage (admin dashboard)
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
