import request from "supertest";
import app from "../../app";
import prisma from "../../config/db";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup";

// A syntactically valid but never-created UUID, for "does not exist" cases
const NON_EXISTENT_ID = "11111111-1111-1111-1111-111111111111";

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
// (mirrors the pattern used in product.test.ts)
const registerAndGetToken = async (): Promise<string> => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Test User",
      email: `customer-${Date.now()}-${Math.random()}@example.com`,
      password: "password123",
    });

  return res.body.token;
};

const createProduct = async (
  overrides: Partial<Record<string, unknown>> = {},
) => {
  return prisma.product.create({
    data: {
      name: "Wireless Mouse",
      description: "A wireless mouse",
      price: 25,
      category: "Electronics",
      stock: 10,
      ...overrides,
    } as Parameters<typeof prisma.product.create>[0]["data"],
  });
};

describe("Cart API Endpoints", () => {
  describe("Auth requirement", () => {
    it("rejects every cart route with no auth token", async () => {
      const getRes = await request(app).get("/api/cart");
      const postRes = await request(app).post("/api/cart").send({});

      expect(getRes.status).toBe(401);
      expect(postRes.status).toBe(401);
    });
  });

  describe("GET /api/cart", () => {
    it("creates and returns an empty cart for a user with no cart yet", async () => {
      const token = await registerAndGetToken();

      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });
  });

  describe("POST /api/cart", () => {
    it("adds a new product to the cart", async () => {
      const token = await registerAndGetToken();
      const product = await createProduct();

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product.id, quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0].quantity).toBe(2);
      expect(res.body.items[0].product.id).toBe(product.id);
    });

    it("increments quantity when the same product is added again", async () => {
      const token = await registerAndGetToken();
      const product = await createProduct({ stock: 10 });

      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product.id, quantity: 2 });

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product.id, quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0].quantity).toBe(5);
    });

    it("rejects adding more than the available stock", async () => {
      const token = await registerAndGetToken();
      const product = await createProduct({ stock: 2 });

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product.id, quantity: 5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/stock/i);
    });

    it("returns 404 for a product that does not exist", async () => {
      const token = await registerAndGetToken();

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: NON_EXISTENT_ID, quantity: 1 });

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/cart/:productId", () => {
    it("updates the quantity of an existing cart item", async () => {
      const token = await registerAndGetToken();
      const product = await createProduct();

      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .put(`/api/cart/${product.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 4 });

      expect(res.status).toBe(200);
      expect(res.body.items[0].quantity).toBe(4);
    });

    it("returns 404 when updating an item not in the cart", async () => {
      const token = await registerAndGetToken();
      const product = await createProduct();

      // No cart created yet for this user
      const res = await request(app)
        .put(`/api/cart/${product.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 4 });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/cart/:productId", () => {
    it("removes a single item from the cart", async () => {
      const token = await registerAndGetToken();
      const productA = await createProduct({ name: "A" });
      const productB = await createProduct({ name: "B" });

      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: productA.id, quantity: 1 });
      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: productB.id, quantity: 1 });

      const res = await request(app)
        .delete(`/api/cart/${productA.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0].product.id).toBe(productB.id);
    });
  });

  describe("DELETE /api/cart", () => {
    it("clears every item from the cart", async () => {
      const token = await registerAndGetToken();
      const product = await createProduct();

      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product.id, quantity: 1 });

      const res = await request(app)
        .delete("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      const cartRes = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(cartRes.body.items).toEqual([]);
    });
  });
});
