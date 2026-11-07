/**
 * Single source of truth for brand, navigation and contact details.
 * TODO(owner): add the second email address and real social links before launch.
 */

import { services } from "@/lib/content/services";

export type NavItem = {
  title: string;
  href: string;
};

export type SocialPlatform = "linkedin" | "x" | "instagram";

export const siteConfig = {
  name: "Nerologik",
  tagline: "Neural thinking. Logical execution.",
  description:
    "Nerologik builds custom software, web and mobile apps, AI automation and digital marketing that help ambitious businesses in Ghana, across Africa and beyond grow.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  location: "Accra, Ghana",
  email: "kwabenacrys@gmail.com",
  // TODO(owner): second contact email (not shown on the contact page)
  secondaryEmail: "" as string,
  whatsappUrl: "https://wa.me/18199198276",
  phones: [
    { label: "Ghana", display: "+233 59 240 5403", tel: "+233592405403" },
    { label: "Canada", display: "+1 (819) 919-8276", tel: "+18199198276" },
  ],
  socials: [
    { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/nerologik" },
    { platform: "x", label: "X (Twitter)", href: "https://x.com/nerologik" },
    { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/nerologik" },
  ] satisfies { platform: SocialPlatform; label: string; href: string }[],
} as const;

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Services", href: "/services" },
  { title: "About", href: "/about" },
  { title: "Insights", href: "/blog" },
  { title: "Contact", href: "/contact" },
];

export const primaryCta: NavItem = { title: "Book a call", href: "/contact" };

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Services",
    items: services.map((s) => ({ title: s.title, href: `/services#${s.slug}` })),
  },
  {
    title: "Company",
    items: [
      { title: "Home", href: "/" },
      { title: "Our work", href: "/services#work" },
      { title: "About", href: "/about" },
      { title: "Insights", href: "/blog" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { title: "Privacy policy", href: "/privacy" },
      { title: "Terms of service", href: "/terms" },
    ],
  },
];
