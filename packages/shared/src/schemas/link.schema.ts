import { z } from 'zod';

export const LinkSchema = z.object({
  shortCode: z.string().length(6).regex(/^[a-zA-Z0-9]+$/),
  originalUrl: z.string().url().max(2048),
  createdAt: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean()
});

export type Link = z.infer<typeof LinkSchema>;
