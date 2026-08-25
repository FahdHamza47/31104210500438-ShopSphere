import { connectDB } from "./config/db"; // Ensure this matches your path to db.ts
import app from "./app";

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
