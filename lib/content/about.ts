import { Eye, Gauge, HeartHandshake, Target, type LucideIcon } from "lucide-react";

export const mission =
  "To give ambitious businesses across Africa the same quality of software, AI and growth marketing that the world's best companies take for granted.";

export const story = [
  "Nerologik started with a simple observation: businesses were hiring one team to build their product and a different team to market it, and the two rarely spoke. Products launched without a plan to reach customers. Campaigns pointed to websites that couldn't convert.",
  "So we built one team that does both. One of us leads software development, the other leads marketing and growth, and every project gets both perspectives from day one.",
  "Today we design, build and grow products used by thousands of people, from AI data platforms and document intelligence tools to booking systems and exam prep for university students.",
];

/** TODO(owner): replace names, bios and add photos (public/team/*.jpg). */
export type Founder = {
  name: string;
  role: string;
  bio: string;
  initials: string;
};

export const founders: Founder[] = [
  {
    name: "Founder name",
    role: "Co-founder · Engineering",
    bio: "Leads software development at Nerologik, from architecture and AI systems to the code that ships. Focused on building products that are fast, secure and built to last.",
    initials: "EN",
  },
  {
    name: "Founder name",
    role: "Co-founder · Marketing & Growth",
    bio: "Leads marketing and growth, making sure every product we build has a plan to reach its customers. Focused on strategy, brand and measurable results.",
    initials: "MG",
  },
];

export type Value = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const values: Value[] = [
  {
    title: "Outcomes over output",
    description: "We measure success by what changes for your business, not by lines of code or hours billed.",
    icon: Target,
  },
  {
    title: "Radical clarity",
    description: "Fixed scopes, honest timelines and weekly demos. You always know where your project stands.",
    icon: Eye,
  },
  {
    title: "Built for real conditions",
    description: "Every product we ship works on everyday phones and real-world networks, not just office Wi-Fi.",
    icon: Gauge,
  },
  {
    title: "Partners, not vendors",
    description: "We stay after launch. Your growth is the only result that matters to us.",
    icon: HeartHandshake,
  },
];
