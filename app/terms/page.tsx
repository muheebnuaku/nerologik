import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use the Nerologik website and services.",
  alternates: { canonical: "/terms" },
};

// TODO(owner): have this reviewed by a qualified lawyer before launch.
const content = `These terms apply to your use of the ${siteConfig.name} website. Project work is governed by a separate written agreement or proposal, which takes priority if there is any conflict.

## Using our website

You may browse and share our website for personal and business purposes. Please don't misuse it: no attempts to disrupt, hack or scrape it, and no unlawful use.

## Our content

The text, design, graphics and code on this website belong to ${siteConfig.name} or our clients and are protected by copyright. Screenshots of client products are shown with permission and remain the property of their owners.

## Quotes and pricing

Prices shown on our website are starting points for guidance only. They are not offers. Every project is confirmed with a written quote that sets out scope, timeline and payment terms.

## Project work

Unless a project agreement says otherwise:

- Work begins once the agreed deposit is received
- Payments are tied to milestones set out in your quote
- Ownership of the final deliverables transfers to you once paid in full
- We may show completed work in our portfolio unless you ask us not to

## Liability

We work hard to keep this website accurate, but it is provided "as is". To the extent the law allows, we are not liable for losses arising from your use of the website. Nothing in these terms limits liability that cannot be limited by law.

## Links to other sites

Our website links to client products and third-party services. We are not responsible for their content or policies.

## Governing law

These terms are governed by the laws of the Republic of Ghana, and the courts of Ghana have jurisdiction.

## Changes

We may update these terms from time to time. The "last updated" date above shows when they last changed.

## Contact

Questions? Email [${siteConfig.email}](mailto:${siteConfig.email}).`;

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updated="2026-11-06" content={content} />;
}
