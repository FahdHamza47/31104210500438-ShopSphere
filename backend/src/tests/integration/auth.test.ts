import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../../app";
import prisma from "../../config/db";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup";

// Runs once before any test in this file
beforeAll(async () => {
  await connectTestDB();
});

// Runs after each individual test
afterEach(async () => {
  await clearTestDB();
});

// Runs once after all tests in this file are done
afterAll(async () => {
  await closeTestDB();
});

describe("Auth API Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully and return a token", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.email).toBe("jane@example.com");
      expect(res.body.role).toBe("customer"); // must default to customer
      expect(res.body).not.toHaveProperty("password"); // password should NEVER be returned
    });

    it("should reject registration with a missing field", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "incomplete@example.com",
        password: "password123",
        // name missing
      });

      expect(res.status).toBe(400);
    });

    it("should reject registration with a duplicate email", async () => {
      // First registration
      await request(app).post("/api/auth/register").send({
        name: "First User",
        email: "duplicate@example.com",
        password: "password123",
      });

      // Second registration attempt with the same email
      const res = await request(app).post("/api/auth/register").send({
        name: "Second User",
        email: "duplicate@example.com",
        password: "password456",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it("should NOT allow a client to register themselves as admin", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Sneaky User",
        email: "sneaky@example.com",
        password: "password123",
        role: "admin", // attempting to inject this
      });

      expect(res.status).toBe(201);
      expect(res.body.role).toBe("customer"); // must be ignored by our controller
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a user directly via Prisma before each login test.
      // The controller hashes on register, so we hash here too — the
      // model itself has no pre-save hook (that was Mongoose-only magic).
      const hashed = await bcrypt.hash("correctpassword", 10);
      await prisma.user.create({
        data: {
          name: "Login Test User",
          email: "login@example.com",
          password: hashed,
        },
      });
    });

    it("should log in successfully with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "correctpassword",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should reject login with an incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });

    it("should reject login for a non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "doesnotexist@example.com",
        password: "whatever",
      });

      expect(res.status).toBe(401);
    });
  });
});
