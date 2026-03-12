import { z } from "zod";

export const AccessActionSchema = z.enum([
  "unlock_door",
  "open_gate",
  "enable_turnstile",
  "grant_wifi"
]);

export const AccessContextSchema = z.object({
  requestId: z.string(),
  identifier: z.string(),
  venueId: z.string(),
  action: AccessActionSchema,
  timestamp: z.string(),
  sources: z.object({
    membership: z.object({
      valid: z.boolean(),
      tier: z.string().nullish(),
      expiresAt: z.string().nullish()
    }).optional(),
    payment: z.object({
      status: z.enum(["paid", "unpaid", "refunded", "chargeback"]),
      transactionId: z.string().nullish(),
      amount: z.number().nullish(),
      currency: z.string().nullish()
    }).optional(),
    age: z.object({
      verified: z.boolean(),
      over18: z.boolean().optional(),
      over21: z.boolean().optional()
    }).optional(),
    blacklist: z.object({
      blocked: z.boolean(),
      reason: z.string().nullish()
    }).optional(),
    booking: z.object({
      valid: z.boolean(),
      start: z.string().nullish(),
      end: z.string().nullish()
    }).optional(),
    custom: z.record(z.unknown()).optional()
  })
});

export type AccessContext = z.infer<typeof AccessContextSchema>;

export const AccessRequestSchema = z.object({
  identifier: z.string().min(1),
  venueId: z.string().min(1),
  action: AccessActionSchema
});
