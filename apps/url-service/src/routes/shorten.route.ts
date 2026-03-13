import { Router } from "express";
import verifyTurnstile from "../middleware/turnstile.js";
import validateShortenRequest from "../middleware/validator.js";
import createShortUrl from "../services/url.service.js";

const router = Router() as import("express").Router;

router.post(
  "/shorten",
  verifyTurnstile,
  validateShortenRequest,
  async (req, res, next) => {
    try {
      const { url } = req.body;
      const result = await createShortUrl(url);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);
export default router;
