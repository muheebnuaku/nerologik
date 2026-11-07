import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { socialIcons } from "@/components/icons/social-icons";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { footerNav, siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border">
      <div className="container-page grid gap-8 py-10 lg:grid-cols-12 lg:gap-8">
        {/* Brand + newsletter */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Link href="/" aria-label={`${siteConfig.name} home`} className="w-fit rounded-md">
            <Logo />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {siteConfig.tagline} We design, build and grow digital products for ambitious teams
            across Africa and beyond.
          </p>
          <div className="flex flex-col gap-3">
            <p className="font-display text-sm font-medium" id="newsletter-heading">
              Insights in your inbox, once a month.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Sitemap */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:justify-items-end"
        >
          {footerNav.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <h2 className="text-eyebrow font-medium uppercase text-muted-foreground font-sans">
                {group.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-brand"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" />
              {siteConfig.location}
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="size-4" aria-hidden="true" />
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
            </li>
            {siteConfig.phones.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className="flex items-center gap-2 transition-colors hover:text-foreground">
                  <Phone className="size-4" aria-hidden="true" />
                  <span className="sr-only">{p.label}: </span>
                  {p.display}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-6">
            <p>
              © {year} {siteConfig.name}
            </p>
            <ul className="flex items-center gap-1">
              {siteConfig.socials.map((social) => {
                const Icon = socialIcons[social.platform];
                return (
                  <li key={social.platform}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
