import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const SUGGESTIONS = [
  { href: "/services", label: "Services & pricing" },
  { href: "/services#work", label: "Our work" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact us" },
];

export default function NotFound() {
  return (
    <section className="relative isolate -mt-(--spacing-nav) overflow-hidden pt-(--spacing-nav)">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-grid mask-hero absolute inset-0" />
        <div className="absolute -top-40 left-1/2 size-112 -translate-x-1/2 rounded-full bg-brand-glow opacity-50 blur-glow" />
      </div>

      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-8 py-12 text-center">
        <div
          aria-hidden="true"
          className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card text-left font-mono text-xs shadow-2xl shadow-black/20 sm:text-sm"
        >
          <div className="flex gap-1.5 border-b border-border px-4 py-3">
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex flex-col gap-2 p-5">
            <p>
              <span className="text-brand">$</span> cd /this-page
            </p>
            <p className="text-destructive">error 404: this neuron didn&apos;t fire.</p>
            <p className="text-muted-foreground">hint: the page moved, or never existed.</p>
            <p className="flex items-center gap-2">
              <span className="text-brand">$</span>
              <span className="inline-block h-4 w-2 animate-pulse bg-brand" />
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <h1 className="text-display-xl font-semibold">Lost in the network.</h1>
          <p className="max-w-md text-lead text-muted-foreground">
            We couldn&apos;t find that page. Our logic is usually flawless, so let&apos;s blame the
            link.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <ArrowLeft />
              Back to home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">
              Talk to us <ArrowRight />
            </Link>
          </Button>
        </div>

        <nav aria-label="Popular pages" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {SUGGESTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="text-muted-foreground underline-offset-4 hover:text-brand hover:underline">
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
