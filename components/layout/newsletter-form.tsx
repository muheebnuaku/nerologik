"use client";

import { useActionState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { subscribeNewsletter, type NewsletterState } from "@/app/newsletter/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initial: NewsletterState = { status: "idle" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);
  const done = state.status === "success";

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <form action={action} className="relative flex w-full flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          maxLength={254}
          disabled={done}
          aria-invalid={state.status === "error" || undefined}
          aria-describedby="newsletter-status"
          className="h-11"
        />
        {/* Honeypot: hidden from people and assistive tech */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label htmlFor="newsletter-website">Website</label>
          <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <Button type="submit" className="h-11" disabled={pending || done}>
          {done ? (
            <>
              Subscribed <Check />
            </>
          ) : pending ? (
            <>
              Subscribing <Loader2 className="animate-spin" />
            </>
          ) : (
            <>
              Subscribe <ArrowRight />
            </>
          )}
        </Button>
      </form>
      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className={cn("min-h-5 text-sm", state.status === "error" ? "text-destructive" : "text-muted-foreground")}
      >
        {state.status === "idle" ? "" : state.message}
      </p>
    </div>
  );
}
