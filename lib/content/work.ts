import type { StaticImageData } from "next/image";

import type { ServiceSlug } from "@/lib/content/services";
import arizonaDesktop from "@/public/work/arizona-creative-minds-desktop.png";
import arizonaMobile from "@/public/work/arizona-creative-minds-mobile.png";
import elsasuDesktop from "@/public/work/elsasu-rentals-desktop.png";
import elsasuMobile from "@/public/work/elsasu-rentals-mobile.png";
import hustleclickDesktop from "@/public/work/hustleclickgh-desktop.png";
import hustleclickMobile from "@/public/work/hustleclickgh-mobile.png";
import nyansaDesktop from "@/public/work/nyansa-ai-desktop.png";
import nyansaMobile from "@/public/work/nyansa-ai-mobile.png";
import pastcsDesktop from "@/public/work/pastcs-desktop.png";
import pastcsMobile from "@/public/work/pastcs-mobile.png";
import taxiDesktop from "@/public/work/taxi-mondial-desktop.png";
import taxiMobile from "@/public/work/taxi-mondial-mobile.png";

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
    slug: "taxi-mondial",
    client: "Taxi Mondial",
    title: "24/7 taxi and transport website for Sherbrooke, Québec",
    summary:
      "A bilingual English/French site for a Sherbrooke taxi company: one-tap calling, online taxi orders, six services from airport transfers to adapted transport, and long-distance routes across Québec.",
    tags: ["Website", "Bilingual", "Local business"],
    categories: ["web"],
    services: ["web-mobile-apps"],
    metric: { value: "24/7", label: "booking by phone or online" },
    liveUrl: "https://taxi-mondial.ca/",
    image: taxiDesktop,
    mobileImage: taxiMobile,
    featured: true,
    content: `## The brief

Taxi Mondial Sherbrooke runs around the clock, for local rides and trips across Québec. Riders needed to find the right service and book it fast, in English or French, usually from a phone.

## What we built

- A bilingual English/French website with a language switch on every page
- A one-tap "Call now" button and an "Order a taxi" flow
- Pages for six services: city taxi, airport transfers, school transport, accessibility and mobility assistance, locksmith lock-outs and battery boosts
- Long-distance routes from Sherbrooke to Montréal, Québec City, Trois-Rivières, Granby, Magog, Drummondville and more
- A blog, plus an about page, contact page and customer feedback section, all built mobile-first

## The result

Riders in Sherbrooke can **book a taxi 24/7**, by phone or online, in their own language.`,
  },
  {
    slug: "arizona-creative-minds",
    client: "Arizona Creative Minds",
    title: "Website for a DDD-licensed disability care provider in Arizona",
    summary:
      "A warm, accessible site for an Arizona provider supporting people with developmental disabilities: services, family testimonials, a careers page and instant chat on WhatsApp, Messenger and Telegram.",
    tags: ["Website", "Healthcare", "Recruiting"],
    categories: ["web"],
    services: ["web-mobile-apps"],
    metric: { value: "DDD", label: "licensed provider in Arizona" },
    liveUrl: "https://arizonacreativemind.com/",
    image: arizonaDesktop,
    mobileImage: arizonaMobile,
    featured: true,
    content: `## The brief

Arizona Creative Minds is a DDD-licensed provider that supports people with developmental disabilities, including autism, cerebral palsy, Down syndrome and epilepsy, at home and in residential settings. Families needed to understand the services and get in touch easily. The team also needed to hire caring staff.

## What we built

- Service pages for habilitation, attendant care, housekeeping, respite and residential support
- A "Who we are" story section with a video, and testimonials from client families
- A "We're hiring" careers page to recruit care professionals
- One-tap chat on WhatsApp, Messenger and Telegram, plus a contact page
- A cookie notice and a calm, mobile-first design built around the brand's artwork

## The result

Families across Arizona can **learn about care options and reach the team in one tap**, and the provider has a steady channel for hiring.`,
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
