"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import { submitLead } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Label, NativeSelect, Textarea } from "@/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import { budgetOptions, leadSchema, serviceOptions, type LeadInput } from "@/lib/validations/lead";

export function ContactForm({ defaultService }: { defaultService?: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const validDefault = serviceOptions.some((o) => o.value === defaultService) ? defaultService : undefined;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      service: validDefault ?? "",
      budget: "",
      message: "",
      website: "",
    },
  });

  const onSubmit = (values: LeadInput) => {
    setResult(null);
    startTransition(async () => {
      const res = await submitLead(values);
      if (res.status === "success") {
        reset();
        setResult({ ok: true, message: res.message });
        return;
      }
      for (const [field, messages] of Object.entries(res.fieldErrors ?? {})) {
        if (messages?.[0]) setError(field as keyof LeadInput, { message: messages[0] });
      }
      setResult({ ok: false, message: res.message });
    });
  };

  if (result?.ok) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-xl border border-primary/40 bg-brand-soft p-8">
        <CheckCircle2 className="size-8 text-brand" aria-hidden="true" />
        <h2 className="font-display text-2xl font-semibold">Message sent</h2>
        <p className="text-muted-foreground">{result.message}</p>
        <Button variant="outline" onClick={() => setResult(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  const describedBy = (field: keyof LeadInput) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            className="h-11 px-3.5"
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            {...register("name")}
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11 px-3.5"
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            {...register("email")}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="company">
          Company <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input id="company" autoComplete="organization" className="h-11 px-3.5" {...register("company")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="service">What do you need?</Label>
          <NativeSelect
            id="service"
            aria-invalid={!!errors.service}
            aria-describedby={describedBy("service")}
            {...register("service")}
          >
            <option value="" disabled>
              Choose a service
            </option>
            {serviceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
          <FieldError id="service-error" message={errors.service?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="budget">Budget</Label>
          <NativeSelect
            id="budget"
            aria-invalid={!!errors.budget}
            aria-describedby={describedBy("budget")}
            {...register("budget")}
          >
            <option value="" disabled>
              Choose a range
            </option>
            {budgetOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
          <FieldError id="budget-error" message={errors.budget?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Tell us about your project</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="What are you building, who is it for, and when do you want to launch?"
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
          {...register("message")}
        />
        <FieldError id="message-error" message={errors.message?.message} />
      </div>

      {/* Honeypot: visually hidden and skipped by keyboard and screen readers */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {result && !result.ok && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          {result.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              Send message
              <ArrowRight />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">We reply within 24 hours, Monday to Saturday.</p>
      </div>
    </form>
  );
}
