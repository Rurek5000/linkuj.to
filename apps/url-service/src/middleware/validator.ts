import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { MAX_URL_LENGTH } from "@shortener/shared";

const ShortenRequestSchema = z.object({
  url: z
    .string()
    .url()
    .max(MAX_URL_LENGTH)
    .refine(
      (url: string) => ["http:", "https:"].includes(new URL(url).protocol),
      { message: "Only http and https URLs are allowed" },
    ),
});

const validateShortenRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = ShortenRequestSchema.safeParse(req.body);

  if (!result.success) {
    res
      .status(400)
      .json({ error: "Validation failed", details: result.error.errors });
    return;
  }

  req.body = result.data;
  next();
};

export type ShortenRequest = z.infer<typeof ShortenRequestSchema>;
export default validateShortenRequest;
