import { linkRepository } from "@shortener/db";
import { generateShortCode, MAX_RETRIES } from "@shortener/shared";
import { UnsafeUrlError, ShortCodeCollisionError } from "../errors.js";
import { isSafeUrl } from "./safe-browsing.service.js";

const BASE_URL = process.env.BASE_URL;

const createShortUrl = async (originalUrl: string) => {
  const safe = await isSafeUrl(originalUrl);
  if (!safe) throw new UnsafeUrlError();

  for (let i = 0; i < MAX_RETRIES; i++) {
    const shortCode = generateShortCode();
    try {
      const link = await linkRepository.create(shortCode, originalUrl);
      return {
        shortCode,
        shortUrl: `${BASE_URL}/${shortCode}`,
        originalUrl,
        expiresAt: link.expiresAt,
      };
    } catch (err: any) {
      if (err.code === "P2002") continue;
      throw err;
    }
  }
  throw new ShortCodeCollisionError();
};

export default createShortUrl;
