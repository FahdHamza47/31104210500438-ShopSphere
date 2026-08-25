import dotenv from "dotenv";
import prisma from "../config/db";

// ==========================================
// 1. Environment Variables Configuration
// ==========================================
dotenv.config();

process.env.JWT_SECRET =
  process.env.JWT_SECRET || "this_is_a_super_secret_key_change_it_later";
process.env.NODE_ENV = "test";

// Prisma has no in-memory Postgres equivalent to mongodb-memory-server, so
// tests run against a real Postgres instance. TEST_DATABASE_URL /
// TEST_DIRECT_URL should point at a disposable database — e.g. the
// `postgres-test` service in docker-compose.yml, NEVER the Supabase
// production database. If they're not set, we fall back to DATABASE_URL,
// but CI always sets TEST_DATABASE_URL explicitly (see
// .github/workflows/test.yml) so production credentials are never used
// for tests.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
if (process.env.TEST_DIRECT_URL) {
  process.env.DIRECT_URL = process.env.TEST_DIRECT_URL;
}

// ==========================================
// 2. Database Utilities
// ==========================================

// Runs once before all tests in a file that imports this.
// Schema must already exist in the test DB — CI runs
// `prisma migrate deploy` against TEST_DATABASE_URL before `npm test`.
export const connectTestDB = async () => {
  await prisma.$connect();
};

// Runs once after all tests in a file that imports this
export const closeTestDB = async () => {
  await prisma.$disconnect();
};

// Runs between individual tests to reset data (keeps tests independent).
// Deleted in FK-safe order: children before parents.
export const clearTestDB = async () => {
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
};
