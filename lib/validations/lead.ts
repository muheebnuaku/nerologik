import { z } from "zod";

import { services } from "@/lib/content/services";

export const serviceOptions = [
  ...services.map((s) => ({ value: s.slug, label: s.title })),
  { value: "not-sure", label: "Not sure yet" },
] as const;

export const budgetOptions = [
  { value: "under-5k", label: "Under GH₵ 5,000" },
  { value: "5k-15k", label: "GH₵ 5,000 – 15,000" },
  { value: "15k-50k", label: "GH₵ 15,000 – 50,000" },
  { value: "50k-plus", label: "GH₵ 50,000+" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

const serviceValues = serviceOptions.map((o) => o.value) as [string, ...string[]];
const budgetValues = budgetOptions.map((o) => o.value) as [string, ...string[]];

/** Shared by the client form and the server action. */
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email address").max(200),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  service: z.enum(serviceValues, { message: "Please choose a service" }),
  budget: z.enum(budgetValues, { message: "Please choose a budget range" }),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more (at least 20 characters)")
    .max(3000, "Please keep it under 3000 characters"),
  /** Honeypot: hidden from humans, bots fill it in */
  website: z.string().max(200).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
