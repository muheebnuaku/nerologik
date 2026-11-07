import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * Secret-key client. BYPASSES RLS — use only in server code after your own
 * checks (validation, rate limiting, admin auth). Never import from client code.
 */
export function createAdminClient() {
  const { url } = supabaseEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing SUPABASE_SECRET_KEY (server-only).");
  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
