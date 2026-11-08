import { z } from "zod";

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
  values,
  yearsOptions,
} from "@/lib/analyzer/options";

const text = (max: number) => z.string().trim().max(max);

/** Shared by the analyser form (per step) and the server action. */
export const analysisSchema = z.object({
  businessName: text(160).min(1, "What's your business called?"),
  industry: z.enum(values(industryOptions), { message: "Choose the closest match" }),
  description: text(1500).min(15, "A sentence or two helps (at least 15 characters)"),

  city: text(120).min(2, "Enter your city or town"),
  country: text(80).min(2, "Enter your country"),
  branches: z.number({ message: "Enter a number" }).int().min(1, "At least 1").max(500),

  yearsInBusiness: z.enum(values(yearsOptions), { message: "Choose one" }),
  teamSize: z.enum(values(teamOptions), { message: "Choose one" }),

  monthlyCustomers: z.enum(values(customerOptions), { message: "Choose a range" }),
  walkInPct: z.number().int().min(0).max(100),

  channels: z.array(z.enum(values(channelOptions))).min(1, "Pick at least one (or “None yet”)"),
  tools: z.array(z.enum(values(toolOptions))).max(8),

  challenges: z.array(z.enum(values(challengeOptions))).min(1, "Pick at least one challenge"),
  goals: z.array(z.enum(values(goalOptions))).min(1, "Pick at least one goal"),
  extraContext: text(1500).optional().or(z.literal("")),

  budget: z.enum(values(budgetOptions), { message: "Choose a range" }),
  timeline: z.enum(values(timelineOptions), { message: "Choose one" }),

  contactName: text(120).min(2, "Please enter your name"),
  email: z.email("Please enter a valid email address").max(200),
  phone: text(40).optional().or(z.literal("")),

  /** Honeypot: hidden from humans, bots fill it in */
  website: z.string().max(200).optional(),
});

export type AnalysisInput = z.infer<typeof analysisSchema>;
