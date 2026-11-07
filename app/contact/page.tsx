import type { Metadata } from "next";
import { CalendarDays, Clock, MapPin, MessageCircle, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us about your project or book a free 30-minute call. Nerologik replies within 24 hours. WhatsApp, email or the form, whatever suits you.",
  alternates: { canonical: "/contact" },
};

const calLink = process.env.NEXT_PUBLIC_CAL_LINK;

type Props = { searchParams: Promise<{ service?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { service } = await searchParams;

  const channels = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: `Chat with us · ${siteConfig.phones[1].display}`,
      href: siteConfig.whatsappUrl,
      external: true,
    },
    ...siteConfig.phones.map((p) => ({
      icon: Phone,
      label: `Call · ${p.label}`,
      value: p.display,
      href: `tel:${p.tel}`,
      external: false,
    })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's build something that works."
        description="Tell us what you're working on. We'll reply within 24 hours with next steps, or book a free 30-minute call below."
      />

      <section aria-label="Contact options" className="section-y">
        <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="mb-6 font-display text-display-md font-semibold">Send us a message</h2>
              <ContactForm defaultService={service} />
            </div>
          </div>

          <aside className="flex flex-col gap-5 lg:col-span-5">
            <ul className="flex flex-col gap-3">
              {channels.map((c) => (
                <li key={c.href}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <c.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-xs text-muted-foreground">{c.label}</span>
                      <span className="truncate font-medium group-hover:text-brand">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <dl className="flex flex-col gap-4 rounded-xl border border-border p-5 text-sm">
              <div className="flex items-start gap-3">
                <dt>
                  <MapPin className="size-4 text-brand" aria-hidden="true" />
                  <span className="sr-only">Location</span>
                </dt>
                <dd className="text-muted-foreground">{siteConfig.location}. Working with clients worldwide.</dd>
              </div>
              <div className="flex items-start gap-3">
                <dt>
                  <Clock className="size-4 text-brand" aria-hidden="true" />
                  <span className="sr-only">Response time</span>
                </dt>
                <dd className="text-muted-foreground">Replies within 24 hours, Monday to Saturday.</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* Booking */}
      <section id="book" aria-labelledby="book-heading" className="section-y border-t border-border">
        <div className="container-page flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-eyebrow uppercase text-brand">Book a call</p>
            <h2 id="book-heading" className="text-display-lg font-semibold">
              Prefer to talk? Pick a time.
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              A free 30-minute call to understand your goals. No pressure, no hard sell, just honest
              advice on the best way forward.
            </p>
          </div>

          {calLink ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <iframe
                src={`https://cal.com/${calLink}?embed=true&theme=dark`}
                title="Book a call with Nerologik"
                loading="lazy"
                className="h-[42rem] w-full"
              />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-border p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <CalendarDays className="size-8 shrink-0 text-brand" aria-hidden="true" />
                <p className="text-muted-foreground">
                  Online booking is coming soon. Message us on WhatsApp and we&apos;ll find a time
                  that works.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle />
                  Book via WhatsApp
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
