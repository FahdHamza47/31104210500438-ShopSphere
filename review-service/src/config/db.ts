import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __reviewPrisma: PrismaClient | undefined;
}

const prisma =
  global.__reviewPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__reviewPrisma = prisma;
}

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("✅ Review service connected to Supabase PostgreSQL (Prisma)");
  } catch (error) {
    console.error(`❌ Error connecting to PostgreSQL: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default prisma;
