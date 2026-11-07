import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Nerologik collects, uses and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

// TODO(owner): have this reviewed by a qualified lawyer before launch.
const content = `This policy explains how ${siteConfig.name} ("we", "us") collects, uses and protects your personal data when you use our website or contact us. We process personal data in line with Ghana's Data Protection Act, 2012 (Act 843) and, where it applies, the EU and UK GDPR.

## What we collect

- **Information you give us:** your name, email address, company, service of interest, budget range and message when you use our contact form, book a call or subscribe to our newsletter.
- **Usage data:** privacy-friendly analytics about how our website is used, such as pages viewed, device type and approximate country. We do not use this to identify you.
- **Communications:** messages you send us by email or WhatsApp.

## How we use it

- To respond to your enquiry and provide quotes or services you request
- To send our newsletter, only if you subscribe (you can unsubscribe at any time)
- To improve our website and services
- To meet legal and accounting obligations

We do **not** sell your personal data, and we do not use it for automated decision-making.

## Who we share it with

We use trusted providers to run our business, including website hosting, database and email services. They process data only on our instructions and under appropriate safeguards. Some providers may store data outside Ghana; where this happens we make sure your data remains protected.

## How long we keep it

We keep enquiry data for up to 24 months after our last contact, and client records for as long as the law requires. Newsletter data is kept until you unsubscribe.

## Your rights

You can ask us to access, correct or delete your personal data, object to how we use it, or withdraw consent at any time. To make a request, email [${siteConfig.email}](mailto:${siteConfig.email}). You also have the right to complain to Ghana's Data Protection Commission.

## Cookies

Our website uses only the cookies needed for it to work (for example, remembering your light or dark theme). We use cookie-free analytics.

## Contact

Questions about this policy? Email [${siteConfig.email}](mailto:${siteConfig.email}).`;

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="2026-11-06" content={content} />;
}
