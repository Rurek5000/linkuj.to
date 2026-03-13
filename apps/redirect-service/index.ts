import express from "express";
import { linkRepository } from "@shortener/db";
import { cacheService } from "@shortener/redis";

const app = express();
const PORT = process.env.PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL)
  throw new Error("Zmienna środowiskowa FRONTEND_URL jest wymagana");

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "redirect-service" });
});

const SHORT_CODE_REGEX = /^[a-z]+-[a-z]+-[a-z]+$/;

app.get("/:short_code", async (req, res) => {
  const { short_code } = req.params;

  if (
    short_code.length > 60 ||
    !SHORT_CODE_REGEX.test(short_code)
  ) {
    res.set("Cache-Control", "no-store");
    return res.redirect(302, `${FRONTEND_URL}/404`);
  }

  try {
    const cached = await cacheService.get<string>(short_code);
    if (cached) {
      res.set("Cache-Control", "private, max-age=300");
      return res.redirect(302, cached);
    }

    const link = await linkRepository.findByShortCode(short_code);

    if (!link || !link.isActive || link.expiresAt < new Date()) {
      res.set("Cache-Control", "no-store");
      return res.redirect(302, `${FRONTEND_URL}/404`);
    }

    const ttl = Math.floor((link.expiresAt.getTime() - Date.now()) / 1000);
    await cacheService.set(short_code, link.originalUrl, ttl);

    res.set("Cache-Control", "private, max-age=300");
    res.redirect(302, link.originalUrl);
  } catch (error) {
    console.error(`Redirect failed for short_code=${short_code}:`, error);
    res.redirect(302, `${FRONTEND_URL}/500`);
  }
});

app.listen(PORT, () => {
  console.log(`Redirect Service listening on port ${PORT}`);
});
