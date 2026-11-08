import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type Researcher = { name: string; isAdmin: boolean; phone: string | null };

/**
 * Allows admins and RIT members into /research. Returns a session-bound
 * client, so RLS keeps every query to the person's own rows.
 */
export const requireResearcher = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect("/rit?error=config");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/rit");

  const [{ data: isAdmin }, { data: member }] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase.from("rit_members").select("name, phone").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!isAdmin && !member) redirect("/rit?error=no-access");

  const researcher: Researcher = {
    name: member?.name ?? user.email?.split("@")[0] ?? "Admin",
    isAdmin: !!isAdmin,
    phone: member?.phone ?? null,
  };
  return { supabase, user, researcher };
});
