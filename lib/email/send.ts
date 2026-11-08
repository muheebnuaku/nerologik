import "server-only";

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.LEAD_NOTIFICATION_FROM);
}

/** Sends one email through Resend's REST API. Never throws. */
export async function sendEmail({ to, subject, html, text, replyTo }: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFICATION_FROM;
  if (!apiKey || !from) return { ok: false, error: "Email is not configured (RESEND_API_KEY / LEAD_NOTIFICATION_FROM)." };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) return { ok: false, error: body.message ?? `Resend responded ${res.status}` };
    return { ok: true, id: body.id ?? "" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}
