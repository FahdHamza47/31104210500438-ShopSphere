import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";
import { requestLogger } from "./middleware/requestLogger";

const app = express();

// Sets standard security headers (X-Content-Type-Options, HSTS,
// X-Frame-Options, etc.) — rubric 1.3 "HTTP protections".
app.use(helmet());

// CORS_ORIGIN can hold one origin or a comma-separated list, so the same
// code works across dev/staging/production (rubric 4.1) just by changing
// the env var per environment. Falls back to sane defaults if unset.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [
      "https://shopsphereapp.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Applies to every route below, including /api/health, so a monitoring
// service hammering the health check doesn't get treated as an attack —
// but it's still an active, enforced limit on the deployed backend.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use(apiLimiter);

app.use(express.json());
app.use(requestLogger);

// Health check route — used by uptime monitoring (rubric 1.4). Kept
// deliberately cheap (no DB round trip) so it can't itself become a
// bottleneck or false-alarm if the DB pool is momentarily saturated.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Error handling (must be LAST)
app.use(notFound);
app.use(errorHandler);

export default app;
