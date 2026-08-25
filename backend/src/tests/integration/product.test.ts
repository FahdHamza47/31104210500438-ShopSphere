import request from "supertest";
import app from "../../app";
import prisma from "../../config/db";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

// Helper function: registers a user and returns their auth token
const registerAndGetToken = async (
  role: "customer" | "admin" = "customer",
): Promise<string> => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Test User",
      email: `${role}-${Date.now()}@example.com`,
      password: "password123",
    });

  // If we need an admin, manually promote them in the DB
  // (mirrors exactly what you did manually in Phase 2!)
  if (role === "admin") {
    await prisma.user.update({
      where: { id: res.body._id },
      data: { role: "admin" },
    });
    // Re-login to get a fresh token with the updated role encoded in it
    const loginRes = await request(app).post("/api/auth/login").send({
      email: res.body.email,
      password: "password123",
    });
    return loginRes.body.token;
  }

  return res.body.token;
};

describe("Product API Endpoints", () => {
  describe("GET /api/products (public)", () => {
    it("should return an empty array and pagination info when no products exist", async () => {
      const res = await request(app).get("/api/products");

      expect(res.status).toBe(200);
      expect(res.body.products).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it("should return products with correct pagination", async () => {
      // Seed 3 products directly via the model
      await prisma.product.createMany({
        data: [
        {
          name: "Product A",
          description: "Desc A",
          price: 10,
          category: "Electronics",
          stock: 5,
        },
        {
          name: "Product B",
          description: "Desc B",
          price: 20,
          category: "Electronics",
          stock: 5,
        },
        {
          name: "Product C",
          description: "Desc C",
          price: 30,
          category: "Clothing",
          stock: 5,
        },
      ],
      });

      const res = await request(app).get("/api/products?limit=2&page=1");

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(2);
      expect(res.body.total).toBe(3);
      expect(res.body.pages).toBe(2);
    });

    it("should filter products by category", async () => {
      await prisma.product.createMany({
        data: [
        {
          name: "Shirt",
          description: "A shirt",
          price: 25,
          category: "Clothing",
          stock: 5,
        },
        {
          name: "Laptop",
          description: "A laptop",
          price: 999,
          category: "Electronics",
          stock: 5,
        },
      ],
      });

      const res = await request(app).get("/api/products?category=Clothing");

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].name).toBe("Shirt");
    });

    it("should sort products by price ascending", async () => {
      await prisma.product.createMany({
        data: [
        {
          name: "Expensive",
          description: "d",
          price: 500,
          category: "X",
          stock: 5,
        },
        { name: "Cheap", description: "d", price: 5, category: "X", stock: 5 },
      ],
      });

      const res = await request(app).get("/api/products?sort=price_asc");

      expect(res.body.products[0].name).toBe("Cheap");
      expect(res.body.products[1].name).toBe("Expensive");
    });
  });

  describe("POST /api/products (admin-protected)", () => {
    it("should reject product creation with no auth token", async () => {
      const res = await request(app).post("/api/products").send({
        name: "Unauthorized Product",
        description: "desc",
        price: 10,
        category: "Test",
        stock: 5,
      });

      expect(res.status).toBe(401);
    });

    it("should reject product creation from a logged-in CUSTOMER (not admin)", async () => {
      const customerToken = await registerAndGetToken("customer");

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Customer Product",
          description: "desc",
          price: 10,
          category: "Test",
          stock: 5,
        });

      expect(res.status).toBe(403); // Forbidden
    });

    it("should allow product creation from an ADMIN user", async () => {
      const adminToken = await registerAndGetToken("admin");

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("name", "Admin Product")
        .field("description", "Created by admin")
        .field("price", "99.99")
        .field("category", "Test")
        .field("stock", "10");

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Admin Product");
    });
  });

  describe("DELETE /api/products/:id (admin-protected)", () => {
    it("should allow an admin to delete a product", async () => {
      const adminToken = await registerAndGetToken("admin");

      const product = await prisma.product.create({
        data: {
          name: "To Delete",
          description: "desc",
          price: 10,
          category: "Test",
          stock: 5,
        },
      });

      const res = await request(app)
        .delete(`/api/products/${product.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const stillExists = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(stillExists).toBeNull();
    });
  });
});
