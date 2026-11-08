import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Ensures the request comes from a signed-in admin (a row in public.admins).
 * Returns a session-bound client: all queries still go through RLS.
 * Cached per request so the layout and page share one check.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) redirect("/admin/login?error=not-admin");

  return { supabase, user };
});
