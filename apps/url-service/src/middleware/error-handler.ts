import { NextFunction, Request, Response } from "express";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(`[url-service] ${req.method} ${req.path}:`, err.message);

  if (err.message.includes("Failed to generate unique short code")) {
    res
      .status(503)
      .json({ error: "Service temporarily unavailable. Please try again." });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;
