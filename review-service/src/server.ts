import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db";
import app from "./app";

// Connect to database safely
connectDB();

// Only listen locally, export app for Vercel serverless functions
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`✅ Review service running on http://localhost:${PORT}`);
  });
}

export default app;
