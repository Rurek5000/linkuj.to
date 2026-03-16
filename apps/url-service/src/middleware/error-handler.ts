import { NextFunction, Request, Response } from "express";
import { UnsafeUrlError, ShortCodeCollisionError } from "../errors.js";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(`[url-service] ${req.method} ${req.path}:`, err.message);

  if (err instanceof ShortCodeCollisionError) {
    res
      .status(503)
      .json({ error: "Service temporarily unavailable. Please try again." });
    return;
  }

  if (err instanceof UnsafeUrlError) {
    res.status(400).json({ error: "This URL has been flagged as unsafe." });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;
