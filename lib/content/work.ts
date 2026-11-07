import type { StaticImageData } from "next/image";

import type { ServiceSlug } from "@/lib/content/services";
import elsasuDesktop from "@/public/work/elsasu-rentals-desktop.png";
import elsasuMobile from "@/public/work/elsasu-rentals-mobile.png";
import hustleclickDesktop from "@/public/work/hustleclickgh-desktop.png";
import hustleclickMobile from "@/public/work/hustleclickgh-mobile.png";
import nyansaDesktop from "@/public/work/nyansa-ai-desktop.png";
import nyansaMobile from "@/public/work/nyansa-ai-mobile.png";
import pastcsDesktop from "@/public/work/pastcs-desktop.png";
import pastcsMobile from "@/public/work/pastcs-mobile.png";

/**
 * Real Nerologik projects. Every fact below is taken from the live product.
 * Mirrors the planned `case_studies` table (Phase 4 moves this to Supabase).
 */

export type ProjectCategory = "ai" | "web" | "payments" | "automation" | "education";

export const projectCategories: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All work" },
  { id: "ai", label: "AI" },
  { id: "web", label: "Web apps" },
  { id: "payments", label: "Payments" },
  { id: "automation", label: "Automation" },
  { id: "education", label: "Education" },
];

export type Project = {
  slug: string;
  client: string;
  title: string;
  summary: string;
  tags: string[];
  categories: ProjectCategory[];
  services: ServiceSlug[];
  /** Only facts the client publishes; omit rather than invent. */
  metric?: { value: string; label: string };
  liveUrl: string;
  liveLabel?: string;
  /** Bundled import (gets a blur placeholder) or a URL/path from the CMS. */
  image?: StaticImageData | string;
  mobileImage?: StaticImageData | string;
  featured: boolean;
  /** Markdown body for the case study page */
  content: string;
};

export const projects: Project[] = [
  {
    slug: "hustleclickgh",
    client: "HustleClickGH",
    title: "Ghana's AI dataset collection platform",
    summary:
      "Contributors record voice in English, Twi, Ga, Hausa and Dagbani, complete surveys and get paid by MTN MoMo or Telecel Cash. A built-in WebRTC dialer records conversations, and AI teams buy consented, compliant datasets.",
    tags: ["Web app", "AI data", "Mobile money"],
    categories: ["ai", "web", "payments"],
    services: ["custom-software", "web-mobile-apps"],
    metric: { value: "1,450+", label: "verified contributors" },
    liveUrl: "https://www.hustleclickgh.com/",
    image: hustleclickDesktop,
    mobileImage: hustleclickMobile,
    featured: true,
    content: `## The brief

AI teams need high-quality speech and survey data in African languages. Many people in Ghana want flexible ways to earn. HustleClickGH connects the two in a single platform that pays contributors through Mobile Money.

## What we built

- A contributor web app with sign-up, a personal dashboard and guided tasks
- Voice recording in English, Twi, Ga, Hausa and Dagbani, exported as configurable WAV datasets (16 kHz or 48 kHz)
- A built-in WebRTC dialer for recording natural two-person conversations
- Survey data collection for research and product teams
- Mobile Money payouts through MTN MoMo and Telecel Cash
- Consent capture designed around Ghana's Data Protection Act, 2012
- A "For Companies" offering covering off-the-shelf datasets, annotation, transcription and translation

## The result

HustleClickGH has **1,450+ verified contributors** across **9 countries**, with consent recorded for every contribution.`,
  },
  {
    slug: "nyansa-ai",
    client: "Nyansa AI",
    title: "Enterprise document intelligence with cited answers",
    summary:
      "Teams ask plain-English questions across contracts, reports and filings and get answers cited to the page and paragraph.",
    tags: ["AI", "SaaS"],
    categories: ["ai", "web"],
    services: ["ai-automation", "custom-software"],
    metric: { value: "AES-256", label: "isolated, encrypted workspace per org" },
    liveUrl: "https://nyansaai.com/",
    image: nyansaDesktop,
    mobileImage: nyansaMobile,
    featured: true,
    content: `## The brief

Enterprise and compliance teams spend hours digging through contracts, reports and filings to answer simple questions. Generic AI chat tools can't be trusted with that work, because their answers can't be verified.

## What we built

- Plain-English questions across uploaded PDFs, reports and spreadsheets
- Every answer cited to the page, paragraph and source document
- An isolated, encrypted workspace for each organisation, on its own subdomain
- AES-256 encryption in transit and at rest
- Role-based access control built in from day one

## The result

Nyansa AI gives teams **document intelligence they can verify**. Every answer links straight back to its source, so it holds up to institutional scrutiny.`,
  },
  {
    slug: "elsasu-rentals",
    client: "Elsasu Rentals",
    title: "Booking platform for chauffeur-driven group travel",
    summary:
      "Instant route quotes, MoMo and card checkout via Paystack, live trip tracking and a WhatsApp booking assistant.",
    tags: ["Web app", "Payments", "AI assistant"],
    categories: ["web", "payments", "automation"],
    services: ["web-mobile-apps", "ai-automation"],
    metric: { value: "Instant", label: "quotes with MoMo & card checkout" },
    liveUrl: "https://www.elsasurentals.com/",
    image: elsasuDesktop,
    mobileImage: elsasuMobile,
    featured: true,
    content: `## The brief

Group travel in Ghana, whether it's churches, weddings, funerals, tours, diaspora visits or staff shuttles, usually means phone calls, waiting and back-and-forth about price. Elsasu Rentals wanted customers to see a price and book in minutes.

## What we built

- A booking flow with instant quotes for airport transfers, half and full days, outstation trips, events and multi-day hires
- MoMo and card payments through Paystack, with a 30% deposit to confirm
- A live tracking link the whole group can follow
- A WhatsApp and on-site booking assistant for questions around the clock
- Fleet, destination and pricing pages that work beautifully on mobile

## The result

Customers see their exact price in seconds, with **no sign-up needed to get a quote**, and pay with the method they already use.`,
  },
  {
    slug: "pastcs",
    client: "PastCS",
    title: "Exam practice for University of Ghana CS students",
    summary:
      "Turns course outlines into real preparation: a growing question bank, timed mock exams and an AI tutor that explains mistakes.",
    tags: ["EdTech", "AI tutor", "Web app"],
    categories: ["education", "ai", "web"],
    services: ["web-mobile-apps", "custom-software"],
    metric: { value: "500+", label: "students" },
    liveUrl: "https://www.pastcs.com/",
    image: pastcsDesktop,
    mobileImage: pastcsMobile,
    featured: true,
    content: `## The brief

Computer Science students at the University of Ghana needed realistic exam practice tied to the courses they actually take, not generic question banks.

## What we built

- A question bank mapped to course outlines, now **1000+ questions** across 6+ courses
- Timed mock exams that simulate the real thing
- An AI tutor that explains what each student got wrong
- A personal dashboard with streaks, scores and course progress
- A leaderboard to keep practice social

## The result

**500+ students** use PastCS to practise, and it's free to start.`,
  },
  {
    slug: "whatsapp-ai-assistant",
    client: "WhatsApp AI Bot",
    title: "AI customer automation on WhatsApp",
    summary:
      "An AI assistant that answers customers, captures details and automates replies directly inside WhatsApp.",
    tags: ["AI automation", "WhatsApp"],
    categories: ["ai", "automation"],
    services: ["ai-automation"],
    liveUrl: "https://wa.me/233270000004",
    liveLabel: "Try it on WhatsApp",
    featured: true,
    content: `## The brief

Customers in Ghana message businesses on WhatsApp first. When those messages go unanswered after hours, the sale goes elsewhere.

## What we built

- An AI assistant that answers customer questions directly inside WhatsApp, 24/7
- Customer detail and request capture, so no lead slips through
- Automated replies for the routine questions your team answers every day

## Try it

Message the assistant on WhatsApp at [027 000 0004](https://wa.me/233270000004) and see how it handles your questions.`,
  },
];
