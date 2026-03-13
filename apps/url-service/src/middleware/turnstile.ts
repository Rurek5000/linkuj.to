import { Request, Response, NextFunction } from "express";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const verifyTurnstile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("[turnstile] Secret key not set, skipping verification");
    next();
    return;
  }

  const token = req.body.turnstileToken;

  if (!token) {
    res.status(400).json({ error: "CAPTCHA verification required" });
    return;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: req.ip || "",
      }),
    });

    if (!response.ok) {
      console.error(`[turnstile] API returned ${response.status}`);
      res.status(500).json({ error: "CAPTCHA verification unavailable" });
      return;
    }

    const data = (await response.json()) as { success: boolean };

    if (!data.success) {
      res.status(403).json({ error: "CAPTCHA verification failed" });
      return;
    }

    next();
  } catch (error) {
    console.error("[turnstile] Verification error:", error);
    res.status(500).json({ error: "CAPTCHA verification unavailable" });
  }
};

export default verifyTurnstile;
