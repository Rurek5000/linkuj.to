import { linkRepository } from "@shortener/db";
import { generateShortCode, MAX_RETRIES } from "@shortener/shared";

const BASE_URL = process.env.BASE_URL;

const createShortUrl = async (originalUrl: string) => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const shortCode = generateShortCode();
    const existingLink = await linkRepository.findByShortCode(shortCode);
    if (existingLink) continue;

    const link = await linkRepository.create(shortCode, originalUrl);
    return {
      shortCode,
      shortUrl: `${BASE_URL}/${shortCode}`,
      originalUrl,
      expiresAt: link.expiresAt,
    };
  }
  throw new Error("Failed to generate unique short code");
};

export default createShortUrl;
