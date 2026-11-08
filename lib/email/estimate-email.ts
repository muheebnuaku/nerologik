import { formatMoney, formatRange } from "@/lib/analyzer/catalog";
import type { AnalysisReport } from "@/lib/analyzer/report";
import { siteConfig } from "@/lib/site-config";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const GREEN = "#15803d";
const INK = "#0a0a0a";
const MUTED = "#52525b";
const LINE = "#e4e4e7";

type EmailArgs = { contactName: string; businessName: string; report: AnalysisReport };

/** Client-facing estimate email. Table layout + inline styles for email clients. */
export function estimateEmail({ contactName, businessName, report: r }: EmailArgs) {
  const firstName = contactName.split(/\s+/)[0];
  const e = r.estimate;
  const oneTime = formatRange(e.oneTimeMin, e.oneTimeMax, e.currency);
  const monthly = e.monthlyMax > 0 ? `${formatRange(e.monthlyMin, e.monthlyMax, e.currency)} / month` : null;
  const contactUrl = `${siteConfig.url}/contact?service=${encodeURIComponent(r.recommendation.service)}`;

  const subject = `Your ${siteConfig.name} business analysis & estimate for ${businessName}`;

  const section = (title: string, body: string) => `
    <tr><td style="padding:24px 32px 0">
      <h2 style="margin:0 0 10px;font-size:16px;line-height:1.3;color:${INK}">${esc(title)}</h2>
      ${body}
    </td></tr>`;

  const p = (t: string) => `<p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:${MUTED}">${esc(t)}</p>`;
  const bullets = (items: string[]) =>
    `<ul style="margin:0;padding:0 0 0 18px">${items
      .map((i) => `<li style="margin:0 0 6px;font-size:14px;line-height:1.5;color:${MUTED}">${esc(i)}</li>`)
      .join("")}</ul>`;

  const lineItems = e.lineItems
    .map(
      (li) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK}">${esc(li.item)}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};text-align:right;white-space:nowrap">${esc(formatMoney(li.amount, e.currency))}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${LINE}">

  <tr><td style="background:#09090b;padding:24px 32px">
    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.02em">${esc(siteConfig.name)}</p>
    <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em">Business analysis &amp; estimate</p>
  </td></tr>

  <tr><td style="padding:28px 32px 0">
    <p style="margin:0 0 12px;font-size:15px;color:${INK}">Hi ${esc(firstName)},</p>
    <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:${MUTED}">Thanks for telling us about <strong style="color:${INK}">${esc(businessName)}</strong>. Here's your tailored analysis and estimate.</p>
    <p style="margin:0;font-size:19px;line-height:1.35;font-weight:700;color:${INK}">${esc(r.headline)}</p>
  </td></tr>

  ${section("Summary", p(r.summary))}

  <tr><td style="padding:24px 32px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${GREEN};border-radius:12px">
      <tr><td style="padding:20px">
        <p style="margin:0;font-size:11px;font-weight:700;color:${GREEN};text-transform:uppercase;letter-spacing:0.08em">Recommended for you</p>
        <p style="margin:6px 0 4px;font-size:18px;font-weight:700;color:${INK}">${esc(r.recommendation.title)}</p>
        <p style="margin:0 0 14px;font-size:13px;color:${MUTED}">${esc(r.recommendation.packageName)} · ${esc(r.recommendation.timeline)}</p>
        <p style="margin:0 0 4px;font-size:12px;color:${MUTED}">Estimated investment</p>
        <p style="margin:0;font-size:24px;font-weight:700;color:${INK}">${esc(oneTime)}</p>
        ${monthly ? `<p style="margin:4px 0 0;font-size:13px;color:${MUTED}">+ ${esc(monthly)} running costs</p>` : ""}
      </td></tr>
    </table>
  </td></tr>

  ${section("Why this fits", p(r.recommendation.why) + bullets(r.recommendation.features))}

  ${section(
    "Cost breakdown",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${lineItems}</table>
     <p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:${MUTED}">Assumptions: ${esc(e.assumptions.join(" · "))}</p>`,
  )}

  ${section(
    `Your digital maturity: ${r.digitalMaturity.score}/10 · ${r.digitalMaturity.label}`,
    p(r.digitalMaturity.explanation) + p(r.customerInsight),
  )}

  ${section(
    "Key findings",
    r.keyFindings.map((f) => `<p style="margin:0 0 10px;font-size:14px;line-height:1.5;color:${MUTED}"><strong style="color:${INK}">${esc(f.title)}.</strong> ${esc(f.detail)}</p>`).join(""),
  )}

  ${section(
    "Your roadmap",
    r.roadmap
      .map(
        (ph) => `<p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${INK}">${esc(ph.phase)} <span style="font-weight:400;color:${MUTED}">· ${esc(ph.timeframe)}</span></p>${bullets(ph.actions)}<div style="height:8px"></div>`,
      )
      .join(""),
  )}

  ${
    r.addOns.length
      ? section(
          "Worth considering later",
          r.addOns
            .map((a) => `<p style="margin:0 0 10px;font-size:14px;line-height:1.5;color:${MUTED}"><strong style="color:${INK}">${esc(a.name)}</strong> (from ${esc(formatMoney(a.priceFrom, e.currency))}). ${esc(a.why)}</p>`)
            .join(""),
        )
      : ""
  }

  <tr><td style="padding:28px 32px">
    <a href="${esc(contactUrl)}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:8px">Book a free call to confirm scope</a>
    <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:${MUTED}">Or reply to this email, or WhatsApp us on ${esc(siteConfig.phones[1].display)}. This is an estimate based on your answers; we confirm a fixed quote after a short discovery call.</p>
  </td></tr>

  <tr><td style="padding:16px 32px;border-top:1px solid ${LINE};background:#fafafa">
    <p style="margin:0;font-size:12px;color:#71717a">${esc(siteConfig.name)} · ${esc(siteConfig.location)} · <a href="${esc(siteConfig.url)}" style="color:${GREEN}">${esc(siteConfig.url.replace(/^https?:\/\//, ""))}</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

  const text = [
    `Hi ${firstName},`,
    ``,
    `Thanks for telling us about ${businessName}. Here's your tailored analysis and estimate.`,
    ``,
    r.headline,
    ``,
    r.summary,
    ``,
    `RECOMMENDED: ${r.recommendation.title} (${r.recommendation.packageName}, ${r.recommendation.timeline})`,
    `Estimated investment: ${oneTime}${monthly ? ` + ${monthly}` : ""}`,
    ``,
    r.recommendation.why,
    ...r.recommendation.features.map((f) => `- ${f}`),
    ``,
    `Cost breakdown:`,
    ...e.lineItems.map((li) => `- ${li.item}: ${formatMoney(li.amount, e.currency)}`),
    `Assumptions: ${e.assumptions.join("; ")}`,
    ``,
    `Book a free call: ${contactUrl}`,
    `WhatsApp: ${siteConfig.phones[1].display}`,
    ``,
    `This is an estimate based on your answers; we confirm a fixed quote after a short discovery call.`,
    `— ${siteConfig.name}`,
  ].join("\n");

  return { subject, html, text };
}

/** Short internal heads-up for the team. */
export function analysisNotificationEmail(args: {
  id: string;
  contactName: string;
  email: string;
  phone?: string | null;
  businessName: string;
  city: string;
  country: string;
  report: AnalysisReport;
}) {
  const e = args.report.estimate;
  const url = `${siteConfig.url}/admin/analyses/${args.id}`;
  const subject = `New analysis: ${args.businessName} → ${args.report.recommendation.packageName}`;
  const text = [
    `${args.contactName} <${args.email}>${args.phone ? ` · ${args.phone}` : ""}`,
    `${args.businessName}, ${args.city}, ${args.country}`,
    `Recommended: ${args.report.recommendation.packageName}`,
    `Estimate: ${formatRange(e.oneTimeMin, e.oneTimeMax, e.currency)}${e.monthlyMax ? ` + ${formatRange(e.monthlyMin, e.monthlyMax, e.currency)}/month` : ""}`,
    ``,
    `Open in admin: ${url}`,
  ].join("\n");
  const html = `<pre style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(text)}</pre>`;
  return { subject, html, text };
}
