import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db";
import app from "./app";

connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Review service running on http://localhost:${PORT}`);
});

export default app;
