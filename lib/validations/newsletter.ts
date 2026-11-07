import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email address.").max(254),
  /** Honeypot: real people never see or fill this. */
  website: z.string().optional(),
});
