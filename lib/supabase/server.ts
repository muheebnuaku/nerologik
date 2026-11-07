import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * Per-request client that carries the signed-in user's session (for /admin).
 * Subject to RLS.
 */
export async function createClient() {
  const { url, publishableKey } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there. Middleware refreshes sessions.
        }
      },
    },
  });
}

/**
 * Cookie-free public client for reading published content. Safe in static
 * rendering and generateStaticParams. Subject to RLS (anon role).
 */
export function createPublicClient(customFetch?: typeof fetch) {
  const { url, publishableKey } = supabaseEnv();
  return createSupabaseClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: customFetch ? { fetch: customFetch } : undefined,
  });
}
