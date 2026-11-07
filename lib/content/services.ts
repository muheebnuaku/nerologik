import { Bot, CodeXml, Smartphone, TrendingUp, type LucideIcon } from "lucide-react";

export type ServiceSlug = "custom-software" | "ai-automation" | "web-mobile-apps" | "digital-marketing";

export type Service = {
  slug: ServiceSlug;
  title: string;
  /** One-liner for menus */
  tagline: string;
  summary: string;
  tags: string[];
  icon: LucideIcon;
  benefits: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  /** PLACEHOLDER pricing — confirm with the team before launch. */
  pricing: {
    from: string;
    unit?: string;
    note?: string;
    timeline: string;
    includes: string[];
    popular?: boolean;
  };
};

/** Ordered by starting price, lowest first. This order is used everywhere services are listed. */
export const services: Service[] = [
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    tagline: "SEO, ads and analytics tied to revenue.",
    summary:
      "Data-led growth across SEO, paid campaigns, content and analytics, measured in revenue rather than vanity metrics.",
    tags: ["SEO", "Paid social", "Analytics"],
    icon: TrendingUp,
    benefits: [
      { title: "Tied to revenue", description: "We track leads, sales and cost per customer, not just likes and impressions." },
      { title: "Strategy plus execution", description: "From content and ads to SEO, one team plans it and does the work." },
      { title: "Transparent reporting", description: "A clear monthly report and a call to decide what to do next." },
    ],
    faqs: [
      { question: "Is ad spend included in the monthly fee?", answer: "No. Ad spend is paid directly to Meta or Google, so you keep full control and visibility. Our fee covers strategy, creative and management." },
      { question: "Why a 3-month minimum?", answer: "Campaigns need time to test, learn and optimise. Three months gives enough data to show real results." },
      { question: "Which platforms do you cover?", answer: "Facebook, Instagram, TikTok, LinkedIn and Google Search, plus SEO and your Google Business Profile." },
    ],
    pricing: {
      from: "GH₵ 2,480",
      unit: "/month",
      note: "Ad spend billed separately",
      timeline: "Ongoing, 3-month minimum",
      includes: [
        "Social media content & posting",
        "Meta & Google ads management",
        "SEO and Google Business Profile",
        "Monthly performance report",
        "Strategy call every month",
      ],
    },
  },
  {
    slug: "web-mobile-apps",
    title: "Web & Mobile Apps",
    tagline: "Fast sites and apps that work on any network.",
    summary:
      "Fast, accessible websites and cross-platform apps built to perform on any device and any network, from fibre to 3G.",
    tags: ["Next.js", "React Native", "PWAs"],
    icon: Smartphone,
    benefits: [
      { title: "Fast on every network", description: "Optimised for real phones and real connections, from fibre to 3G." },
      { title: "Designed to convert", description: "Clear messaging and calls to action that turn visitors into enquiries and sales." },
      { title: "Easy to update", description: "Change your content yourself, with no developer needed for everyday edits." },
    ],
    faqs: [
      { question: "How long does a website take?", answer: "Most business websites launch in 2–4 weeks. Web apps and mobile apps usually take 6–12 weeks depending on scope." },
      { question: "Do you build for both iPhone and Android?", answer: "Yes. We build cross-platform apps with React Native, so one codebase runs on both, which saves time and budget." },
      { question: "Will my site show up on Google?", answer: "Every site ships with technical SEO, fast load times, metadata and Google Analytics. For ongoing rankings, pair it with our marketing service." },
    ],
    pricing: {
      from: "GH₵ 3,480",
      note: "Mobile apps from GH₵ 19,800",
      timeline: "2–8 weeks",
      includes: [
        "Mobile-first, fast-loading design",
        "SEO setup & Google Analytics",
        "WhatsApp, forms & booking",
        "Content management",
        "1 month of free changes",
      ],
    },
  },
  {
    slug: "ai-automation",
    title: "AI Automation",
    tagline: "Agents and WhatsApp bots that do the busywork.",
    summary:
      "Agents, chatbots and workflows that take repetitive work off your team, from WhatsApp support to document processing.",
    tags: ["AI agents", "WhatsApp bots", "Workflows"],
    icon: Bot,
    benefits: [
      { title: "Answer customers 24/7", description: "Never miss a sale because a message came in after hours." },
      { title: "Free up your team", description: "Automate repetitive questions and data entry so people focus on work that matters." },
      { title: "Grounded in your data", description: "Assistants trained on your products, prices and policies, so answers stay accurate." },
    ],
    faqs: [
      { question: "Will the AI give customers wrong answers?", answer: "We ground the assistant in your own information and set clear limits on what it can say. When it isn't sure, it hands the conversation to your team." },
      { question: "Do I need the WhatsApp Business API?", answer: "For a production WhatsApp assistant, yes. We handle the setup and verification with you as part of the project." },
      { question: "What are the monthly costs?", answer: "Hosting and AI usage depend on message volume. We estimate it upfront and send a monthly usage report so there are no surprises." },
    ],
    pricing: {
      from: "GH₵ 3,880",
      note: "+ monthly hosting",
      timeline: "1–3 weeks",
      includes: [
        "AI WhatsApp or website assistant",
        "Trained on your products & FAQs",
        "Orders, bookings or lead capture",
        "Hand-off to a human when needed",
        "Monthly usage report",
      ],
      popular: true,
    },
  },
  {
    slug: "custom-software",
    title: "Custom Software",
    tagline: "Platforms and tools built around your business.",
    summary:
      "Platforms, internal tools and integrations engineered around how your business actually runs, not the other way round.",
    tags: ["SaaS platforms", "ERP & CRM", "APIs & integrations"],
    icon: CodeXml,
    benefits: [
      { title: "Fits how you work", description: "Software shaped around your processes, not a template you have to bend around." },
      { title: "You own everything", description: "Your code, your data and your infrastructure, with full documentation at handover." },
      { title: "Built to scale", description: "Clean architecture that grows from your first 100 users to your first 100,000." },
    ],
    faqs: [
      { question: "How do you price custom software?", answer: "After a free discovery call we send a fixed quote based on a clear scope. You'll know exactly what's included before any work starts." },
      { question: "Can you integrate with tools we already use?", answer: "Yes. We regularly integrate payments (MoMo, card, Paystack), SMS, WhatsApp, accounting tools and existing databases or APIs." },
      { question: "What happens after launch?", answer: "Every build includes 3 months of support. After that, you can choose a monthly maintenance plan or take over fully. It's your code." },
    ],
    pricing: {
      from: "GH₵ 14,800",
      timeline: "6–12 weeks",
      includes: [
        "Discovery workshop & fixed scope",
        "Admin dashboard & user roles",
        "Payments: MoMo, card, Paystack",
        "Hosting setup & handover docs",
        "3 months of support",
      ],
    },
  },
];

export const generalFaqs: { question: string; answer: string }[] = [
  { question: "Where are you based? Do you work with international clients?", answer: "We're based in Accra, Ghana, and work with clients across Africa and worldwide. International projects are quoted in USD." },
  { question: "How do payments work?", answer: "Projects are usually split into milestones: a deposit to start, then payments tied to delivery. We accept MoMo, bank transfer and card." },
  { question: "Do you sign NDAs?", answer: "Yes. We're happy to sign an NDA before you share details of your idea." },
  { question: "What do you need from me to get started?", answer: "Just a conversation. Book a free call and tell us what you're trying to achieve. We'll handle the rest of the scoping." },
];
