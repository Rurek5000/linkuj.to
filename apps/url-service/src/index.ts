import express from "express";
import helmet from "helmet";
import shortenRouter from "./routes/shorten.route.js";
import errorHandler from "./middleware/error-handler.js";
import rateLimiter from "./middleware/rate-limiter.js";

if (!process.env.BASE_URL) {
  console.error("ERROR: BASE_URL environment variable is required");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "url-service" });
});

app.use("/api", rateLimiter, shortenRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`URL Service listening on port ${PORT}`);
});
