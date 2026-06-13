import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1).max(80),
  price: z.string().max(20).optional(),
});

// Compartilhado entre POST /api/profiles e PUT /api/profiles/[id].
export const profileInputSchema = z.object({
  businessName: z.string().min(1).max(100),
  niche: z.string().min(1).max(100),
  services: z.array(serviceSchema).max(20).default([]),
  tone: z.enum(["descontraido", "profissional", "premium"]).default("descontraido"),
  differentials: z.string().max(500).default(""),
  city: z.string().max(80).default(""),
  neighborhood: z.string().max(80).default(""),
  recurringPromos: z.string().max(300).nullish(),
  instagramHandle: z.string().max(60).nullish(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
