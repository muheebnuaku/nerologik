import { NextResponse, type NextRequest } from "next/server";

import { sendEmail } from "@/lib/email/send";
import { isWorkingDay, todayAccra, weekday, weekStart } from "@/lib/research/analysis";
import { study } from "@/lib/research/config";
import { siteConfig } from "@/lib/site-config";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Weekday 16:30 Accra reminder (Vercel Cron, see vercel.json).
 * Emails each admin who has research going but hasn't logged today.
 * Fridays add the weekly-review link; from the 28th, the problem choice.
 * Contains no observation content, only links.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = todayAccra();
  if (today < study.start || today > study.end || !isWorkingDay(today)) {
    return NextResponse.json({ skipped: "outside observation working days" });
  }

  const db = createAdminClient();
  const { data: admins } = await db.from("admins").select("user_id");
  const sent: string[] = [];

  for (const { user_id } of admins ?? []) {
    // Only people who have actually started the study (have a process map).
    const { count: started } = await db.from("research_process_steps").select("id", { count: "exact", head: true }).eq("user_id", user_id);
    if (!started) continue;

    const { count: loggedToday } = await db
      .from("research_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user_id)
      .eq("observer", "me")
      .eq("log_date", today);

    const friday = weekday(today) === 5;
    const choosing = today >= study.chooseFrom;
    if (loggedToday && !friday && !choosing) continue;

    const { data: u } = await db.auth.admin.getUserById(user_id);
    const email = u.user?.email;
    if (!email) continue;

    const base = `${siteConfig.url}/research`;
    const lines = [
      !loggedToday && `• Write today's log (5–10 minutes): ${base}/log/${today}`,
      friday && `• Friday review is drafted and waiting: ${base}/week?w=${weekStart(today)}`,
      choosing && `• Choose the problem and finish the one-page summary: ${base}/problems`,
    ].filter(Boolean) as string[];

    const subject = !loggedToday ? "DMCE log: 5 minutes before you leave" : friday ? "DMCE: your weekly review is ready" : "DMCE: time to choose the problem";
    const text = `${lines.join("\n")}\n\nRecord the process, never the taxpayer.`;
    const html = `<div style="font:14px/1.6 Inter,Segoe UI,Arial,sans-serif;color:#111">${lines
      .map((l) => l.replace(/(https?:\/\/\S+)/, '<a href="$1" style="color:#15803d">open</a>'))
      .join("<br>")}<p style="color:#666;font-size:12px">Record the process, never the taxpayer.</p></div>`;

    const res = await sendEmail({ to: email, subject, text, html });
    if (res.ok) sent.push(user_id);
    else console.error("[research] reminder failed:", res.error);
  }

  return NextResponse.json({ sent: sent.length });
}
