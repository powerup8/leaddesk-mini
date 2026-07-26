import { z } from "zod";

export const leadStatuses = ["new", "contacted", "closed"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const leadSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(100, "Keep it under 100 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  company: z
    .string()
    .trim()
    .max(100, "Keep it under 100 characters.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Give us at least 10 characters so we know how to help.")
    .max(2000, "Keep it under 2000 characters."),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const statusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(leadStatuses),
});
