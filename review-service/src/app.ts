import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import reviewRoutes from "./routes/reviewRoutes";

const app = express();

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Review service is running!",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/reviews", reviewRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "error",
    message: err.message,
    stack: err.stack,
  }));
  res.status(500).json({ message: err.message });
});

export default app;
