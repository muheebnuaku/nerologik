/**
 * Home page placeholder content.
 * Case studies, screenshots and stats are real (taken from the live products).
 * PLACEHOLDER: testimonials are illustrative and must be replaced before launch. Case studies and
 * testimonials move to Supabase in Phase 4; shapes mirror the planned tables.
 */


export type ProcessStep = {
  title: string;
  description: string;
  outputs: string[];
};

export const processSteps: ProcessStep[] = [
  {
    title: "Discover",
    description:
      "Workshops, user research and a clear technical and commercial plan. You know exactly what we will build, why, and what it costs.",
    outputs: ["Roadmap", "Fixed scope"],
  },
  {
    title: "Design",
    description:
      "Wireframes, interactive prototypes and a design system, tested with real users before any production code is written.",
    outputs: ["Prototype", "Design system"],
  },
  {
    title: "Build",
    description:
      "Two-week sprints with weekly demos. Clean, tested code shipped to production on infrastructure you own.",
    outputs: ["Production app", "Handover docs"],
  },
  {
    title: "Grow",
    description:
      "Launch campaigns, analytics and continuous iteration. We measure what matters and keep improving it.",
    outputs: ["Growth plan", "Monthly reports"],
  },
];

export type Stat = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

/** Figures published on the live products we built. */
export const stats: Stat[] = [
  { value: 5, label: "Products live in production" },
  { value: 1450, suffix: "+", label: "Contributors on HustleClickGH" },
  { value: 500, suffix: "+", label: "Students preparing on PastCS" },
  { value: 9, label: "Countries reached" },
];

/** Mirrors `testimonials`. */
export type TestimonialPreview = {
  name: string;
  role: string;
  company: string;
  quote: string;
};

export const testimonials: TestimonialPreview[] = [
  {
    name: "Ama Owusu",
    role: "COO",
    company: "Volta Health",
    quote:
      "Nerologik understood our users better than we did. The app works on the cheapest phones in the most remote clinics, and it shows in our numbers.",
  },
  {
    name: "Tunde Bakare",
    role: "Founder",
    company: "KasaHub",
    quote:
      "Having engineering and marketing in one team changed everything. Every feature they shipped came with a plan to get it in front of customers.",
  },
  {
    name: "Wanjiru Kamau",
    role: "Programme Lead",
    company: "Coastline Trust",
    quote:
      "Clear process, honest pricing and weekly demos. We always knew where the project stood, and they delivered ahead of our grant deadline.",
  },
];
