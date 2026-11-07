"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/** Browser client (publishable key). Subject to RLS. */
export function createClient() {
  const { url, publishableKey } = supabaseEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
