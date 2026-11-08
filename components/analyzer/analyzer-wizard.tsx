"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Controller, useForm, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";

import { submitAnalysis } from "@/app/analyzer/actions";
import { ReportView } from "@/components/analyzer/report-view";
import { Button } from "@/components/ui/button";
import { FieldError, Label, Textarea } from "@/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import {
  budgetOptions,
  challengeOptions,
  channelOptions,
  customerOptions,
  goalOptions,
  industryOptions,
  teamOptions,
  timelineOptions,
  toolOptions,
  yearsOptions,
} from "@/lib/analyzer/options";
import type { AnalysisReport } from "@/lib/analyzer/report";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { analysisSchema, type AnalysisInput } from "@/lib/validations/analysis";

type Field = FieldPath<AnalysisInput>;
type Opt = { value: string; label: string };

type Step = {
  title: (name: string) => string;
  hint?: string;
  fields: Field[];
};

const steps: Step[] = [
  { title: () => "Let's start. What's your business called?", fields: ["businessName"] },
  { title: (n) => `What does ${n} do?`, hint: "Pick the closest match, then describe it in your own words.", fields: ["industry", "description"] },
  { title: () => "Where are you based?", hint: "Location shapes payments, channels and pricing.", fields: ["city", "country", "branches"] },
  { title: () => "How established is the business?", fields: ["yearsInBusiness", "teamSize"] },
  { title: () => "Roughly how many customers do you serve each month?", fields: ["monthlyCustomers"] },
  { title: () => "How do your customers reach you?", hint: "Drag to show the split between walk-ins and online (calls, WhatsApp, social, web).", fields: ["walkInPct"] },
  { title: () => "Where can customers find you online today?", hint: "Select all that apply.", fields: ["channels"] },
  { title: () => "What do you use to run the business?", hint: "Select all that apply, or skip.", fields: ["tools"] },
  { title: () => "What's holding the business back?", hint: "Pick up to four.", fields: ["challenges"] },
  { title: () => "What do you want to achieve in the next 12 months?", hint: "Select all that apply.", fields: ["goals", "extraContext"] },
  { title: () => "What budget and timeline are you working with?", fields: ["budget", "timeline"] },
  { title: () => "Where should we send your analysis?", hint: "We'll email you the full report and estimate. No spam.", fields: ["contactName", "email", "phone"] },
];

const loadingMessages = [
  "Reading your answers…",
  "Looking at your location and customer mix…",
  "Comparing walk-in and online opportunities…",
  "Matching you with the best-fit solution…",
  "Working out a realistic estimate…",
  "Writing your report…",
];

export function AnalyzerWizard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ report: AnalysisReport; emailed: boolean; businessName: string; email: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const form = useForm<AnalysisInput>({
    resolver: zodResolver(analysisSchema),
    mode: "onTouched",
    defaultValues: {
      businessName: "",
      description: "",
      city: "",
      country: "Ghana",
      branches: 1,
      walkInPct: 50,
      channels: [],
      tools: [],
      challenges: [],
      goals: [],
      extraContext: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
    },
  });
  const { register, control, trigger, handleSubmit, watch, setError: setFieldError, formState } = form;
  const errors = formState.errors;
  const businessName = watch("businessName")?.trim() || "your business";
  const current = steps[step];
  const isLast = step === steps.length - 1;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const next = async () => {
    if (await trigger(current.fields)) go(step + 1);
  };

  const onSubmit = (values: AnalysisInput) => {
    setError(null);
    startTransition(async () => {
      const res = await submitAnalysis(values);
      if (res.status === "success") {
        setResult({ report: res.report, emailed: res.emailed, businessName: values.businessName, email: values.email });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const fieldErrors = Object.entries(res.fieldErrors ?? {});
      for (const [field, messages] of fieldErrors) {
        if (messages?.[0]) setFieldError(field as Field, { message: messages[0] });
      }
      // Jump back to the first step with an error.
      const firstBad = steps.findIndex((s) => s.fields.some((f) => fieldErrors.some(([k]) => k === f)));
      if (firstBad >= 0) go(firstBad);
      setError(res.message);
    });
  };

  if (result) {
    return (
      <div className="flex flex-col gap-5">
        <div
          role="status"
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 text-sm",
            result.emailed ? "border-primary/40 bg-brand-soft" : "border-border bg-card",
          )}
        >
          <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
          <p>
            {result.emailed ? (
              <>A copy of this report is on its way to <strong>{result.email}</strong>. Check your spam folder if it isn&apos;t there in a few minutes.</>
            ) : (
              <>Your report is ready below. We couldn&apos;t email it just now, but our team has your details and will follow up.</>
            )}
          </p>
        </div>
        <ReportView report={result.report} businessName={result.businessName} />
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            This estimate is based on your answers. We confirm a fixed quote after a free 30-minute call.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button asChild>
              <Link href={`/contact?service=${result.report.recommendation.service}`}>
                Book a free call <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          className="self-start"
          onClick={() => {
            setResult(null);
            form.reset();
            go(0);
          }}
        >
          <RotateCcw /> Start a new analysis
        </Button>
      </div>
    );
  }

  if (isPending) return <AnalysingScreen />;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isLast) void handleSubmit(onSubmit)(e);
        else void next();
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Question {step + 1} of {steps.length}
          </span>
          <span>{Math.round((step / steps.length) * 100)}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={step + 1}
          aria-label="Progress"
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="relative min-h-80 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.fieldset
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -32 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-4"
          >
            <legend className="sr-only">{current.title(businessName)}</legend>
            <div className="flex flex-col gap-1">
              <h2 ref={headingRef} tabIndex={-1} className="font-display text-xl font-semibold outline-none sm:text-2xl">
                {current.title(businessName)}
              </h2>
              {current.hint && <p className="text-sm text-muted-foreground">{current.hint}</p>}
            </div>

            {step === 0 && (
              <TextField id="businessName" label="Business name" error={errors.businessName?.message} autoFocus autoComplete="organization" {...register("businessName")} />
            )}

            {step === 1 && (
              <>
                <ChoiceField control={control} name="industry" options={industryOptions} error={errors.industry?.message} />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Describe what you sell or offer, and who your customers are</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    className="min-h-24"
                    placeholder="e.g. We sell women's fashion and accessories to young professionals in Accra, mostly through Instagram and our shop in Osu."
                    aria-invalid={!!errors.description}
                    {...register("description")}
                  />
                  <FieldError id="description-error" message={errors.description?.message} />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem]">
                <TextField id="city" label="City or town" error={errors.city?.message} autoComplete="address-level2" autoFocus {...register("city")} />
                <TextField id="country" label="Country" error={errors.country?.message} autoComplete="country-name" {...register("country")} />
                <TextField
                  id="branches"
                  label="Locations"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  error={errors.branches?.message}
                  {...register("branches", { valueAsNumber: true })}
                />
              </div>
            )}

            {step === 3 && (
              <>
                <ChoiceField control={control} name="yearsInBusiness" label="Time in business" options={yearsOptions} error={errors.yearsInBusiness?.message} />
                <ChoiceField control={control} name="teamSize" label="Team size" options={teamOptions} error={errors.teamSize?.message} />
              </>
            )}

            {step === 4 && (
              <ChoiceField control={control} name="monthlyCustomers" options={customerOptions} error={errors.monthlyCustomers?.message} />
            )}

            {step === 5 && <MixSlider control={control} />}

            {step === 6 && (
              <ChoiceField control={control} name="channels" multiple exclusive="none" options={channelOptions} error={errors.channels?.message} />
            )}

            {step === 7 && <ChoiceField control={control} name="tools" multiple options={toolOptions} error={errors.tools?.message} />}

            {step === 8 && (
              <ChoiceField control={control} name="challenges" multiple max={4} options={challengeOptions} error={errors.challenges?.message} />
            )}

            {step === 9 && (
              <>
                <ChoiceField control={control} name="goals" multiple options={goalOptions} error={errors.goals?.message} />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="extraContext">
                    Anything else we should know? <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea id="extraContext" rows={2} className="min-h-20" placeholder="e.g. We're opening a second shop in Kumasi next year." {...register("extraContext")} />
                </div>
              </>
            )}

            {step === 10 && (
              <>
                <ChoiceField control={control} name="budget" label="Budget" options={budgetOptions} error={errors.budget?.message} />
                <ChoiceField control={control} name="timeline" label="When do you want to start?" options={timelineOptions} error={errors.timeline?.message} />
              </>
            )}

            {step === 11 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField id="contactName" label="Your name" autoComplete="name" autoFocus error={errors.contactName?.message} {...register("contactName")} />
                  <TextField id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
                </div>
                <TextField
                  id="phone"
                  label={
                    <>
                      Phone / WhatsApp <span className="font-normal text-muted-foreground">(optional)</span>
                    </>
                  }
                  type="tel"
                  autoComplete="tel"
                  {...register("phone")}
                />
                <p className="text-xs text-muted-foreground">
                  By continuing you agree that we can contact you about this analysis. See our{" "}
                  <Link href="/privacy" className="underline underline-offset-2">
                    privacy policy
                  </Link>
                  .
                </p>
              </>
            )}
          </motion.fieldset>
        </AnimatePresence>
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={() => go(step - 1)} disabled={step === 0} className={cn(step === 0 && "invisible")}>
          <ArrowLeft /> Back
        </Button>
        <Button type="submit" size="lg">
          {isLast ? (
            <>
              <Sparkles /> Analyse my business
            </>
          ) : (
            <>
              {step === 7 && watch("tools").length === 0 ? "Skip" : "Next"} <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ───────────────────────────── Inputs ───────────────────────────── */

type TextFieldProps = React.ComponentProps<typeof Input> & { id: string; label: React.ReactNode; error?: string };

function TextField({ id, label, error, ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="h-11 px-3.5" aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

type ChoiceFieldProps = {
  control: Control<AnalysisInput>;
  name: Field;
  options: readonly Opt[];
  label?: string;
  error?: string;
  multiple?: boolean;
  /** For multi-select: a value that clears all others when chosen (e.g. "none"). */
  exclusive?: string;
  max?: number;
};

/** Chip-style single or multi choice. */
function ChoiceField({ control, name, options, label, error, multiple, exclusive, max }: ChoiceFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = multiple ? ((field.value as string[] | undefined) ?? []) : field.value ? [field.value as string] : [];

        const toggle = (value: string) => {
          if (!multiple) return field.onChange(value);
          if (selected.includes(value)) return field.onChange(selected.filter((v) => v !== value));
          if (value === exclusive) return field.onChange([value]);
          const base = selected.filter((v) => v !== exclusive);
          if (max && base.length >= max) return;
          field.onChange([...base, value]);
        };

        return (
          <div className="flex flex-col gap-2" role="group" aria-label={label}>
            {label && <p className="text-sm font-medium">{label}</p>}
            <div className="flex flex-wrap gap-2">
              {options.map((o) => {
                const on = selected.includes(o.value);
                const atMax = !!max && !on && selected.length >= max;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role={multiple ? "checkbox" : "radio"}
                    aria-checked={on}
                    disabled={atMax}
                    onClick={() => toggle(o.value)}
                    onBlur={field.onBlur}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm transition-colors duration-(--duration-base) outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40",
                      on ? "border-primary bg-brand-soft text-foreground" : "border-input bg-background hover:border-brand/40",
                    )}
                  >
                    {on && <Check className="size-3.5 text-brand" aria-hidden="true" />}
                    {o.label}
                  </button>
                );
              })}
            </div>
            <FieldError id={`${name}-error`} message={error} />
          </div>
        );
      }}
    />
  );
}

function MixSlider({ control }: { control: Control<AnalysisInput> }) {
  return (
    <Controller
      control={control}
      name="walkInPct"
      render={({ field }) => {
        const walkIn = Number(field.value) || 0;
        return (
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Walk-in / in person</p>
                <p className="font-display text-3xl font-semibold tabular-nums">{walkIn}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Online / phone / WhatsApp</p>
                <p className="font-display text-3xl font-semibold text-brand tabular-nums">{100 - walkIn}%</p>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={walkIn}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
              aria-label="Percentage of customers who walk in"
              aria-valuetext={`${walkIn}% walk-in, ${100 - walkIn}% online`}
              className="w-full accent-(--primary)"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>All walk-in</span>
              <span>All online</span>
            </div>
          </div>
        );
      }}
    />
  );
}

function AnalysingScreen() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, loadingMessages.length - 1)), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div role="status" aria-live="polite" className="flex min-h-80 flex-col items-center justify-center gap-5 text-center">
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-glow" aria-hidden="true" />
        <Loader2 className="size-8 animate-spin text-brand" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-semibold">Analysing your business</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-sm text-muted-foreground"
          >
            {loadingMessages[i]}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="max-w-sm text-xs text-muted-foreground">This usually takes under a minute. Please keep this page open.</p>
    </div>
  );
}
