import express from "express";
import { linkRepository } from "@shortener/db";
import { cacheService } from "@shortener/redis";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.delete("/api/links/:short_code", async (req, res) => {
  const { short_code } = req.params;

  try {
    const link = await linkRepository.findByShortCode(short_code);

    if (!link) {
      res.status(404).json({ error: "Link not found" });
      return;
    }

    if (!link.isActive) {
      res.status(404).json({ error: "Link already deleted" });
      return;
    }

    await linkRepository.softDelete(short_code);
    await cacheService.delete(short_code);

    res.status(200).json({ message: "Link deleted" });
  } catch (error) {
    console.error(`[management-service] DELETE ${short_code}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "management-service" });
});

app.listen(PORT, () => {
  console.log(`Management Service listening on port ${PORT}`);
});
