import { z } from 'zod';

export const LinkSchema = z.object({
  shortCode: z.string().min(3).max(60).regex(/^[a-z]+-[a-z]+-[a-z]+$/),
  originalUrl: z.string().url().max(2048),
  createdAt: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean()
});

export type Link = z.infer<typeof LinkSchema>;
