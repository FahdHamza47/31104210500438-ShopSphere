import request from "supertest";
import app from "../../app";
import prisma from "../../config/db";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup";

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
const registerAndGetToken = async (
  role: "customer" | "admin" = "customer",
): Promise<{ token: string; userId: string }> => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Test User",
      email: `${role}-${Date.now()}-${Math.random()}@example.com`,
      password: "password123",
    });

  if (role === "admin") {
    await prisma.user.update({
      where: { id: res.body._id },
      data: { role: "admin" },
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: res.body.email,
      password: "password123",
    });
    return { token: loginRes.body.token, userId: res.body._id };
  }

  return { token: res.body.token, userId: res.body._id };
};

const sampleShippingAddress = {
  fullName: "Jane Doe",
  address: "123 Main St",
  city: "Springfield",
  postalCode: "12345",
  country: "USA",
  phone: "555-0100",
};

const buildOrderPayload = (
  product: { id: string; name: string; price: number },
  quantity: number,
) => ({
  orderItems: [
    {
      product: product.id,
      name: product.name,
      image: "",
      price: product.price,
      quantity,
    },
  ],
  shippingAddress: sampleShippingAddress,
  subtotal: product.price * quantity,
  tax: 0,
  shipping: 0,
  totalPrice: product.price * quantity,
});

describe("Order API Endpoints", () => {
  describe("Auth requirement", () => {
    it("rejects order creation with no auth token", async () => {
      const res = await request(app).post("/api/orders").send({});
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/orders", () => {
    it("creates an order and decrements product stock accordingly", async () => {
      const { token } = await registerAndGetToken();
      const product = await prisma.product.create({
        data: {
        name: "Keyboard",
        description: "A keyboard",
        price: 50,
        category: "Electronics",
        stock: 10,
      },
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(buildOrderPayload(product, 3));

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("Pending");
      expect(res.body.orderItems.length).toBe(1);

      const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
      expect(updatedProduct?.stock).toBe(7); // 10 - 3
    });

    it("rejects an order with no items", async () => {
      const { token } = await registerAndGetToken();

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ orderItems: [], shippingAddress: sampleShippingAddress });

      expect(res.status).toBe(400);
    });

    it("rejects an order that exceeds available stock and leaves stock untouched", async () => {
      const { token } = await registerAndGetToken();
      const product = await prisma.product.create({
        data: {
        name: "Limited Item",
        description: "Only 2 left",
        price: 20,
        category: "Electronics",
        stock: 2,
      },
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(buildOrderPayload(product, 5));

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/insufficient stock/i);

      const unchangedProduct = await prisma.product.findUnique({ where: { id: product.id } });
      expect(unchangedProduct?.stock).toBe(2);
    });

    it("rolls back stock already decremented earlier in the same order if a later item fails", async () => {
      const { token } = await registerAndGetToken();
      const productA = await prisma.product.create({
        data: {
        name: "In Stock Item",
        description: "d",
        price: 10,
        category: "X",
        stock: 5,
      },
      });
      const productB = await prisma.product.create({
        data: {
        name: "Out of Stock Item",
        description: "d",
        price: 10,
        category: "X",
        stock: 1,
      },
      });

      const payload = {
        orderItems: [
          {
            product: productA.id,
            name: productA.name,
            image: "",
            price: productA.price,
            quantity: 2,
          },
          {
            product: productB.id,
            name: productB.name,
            image: "",
            price: productB.price,
            quantity: 5, // exceeds available stock of 1
          },
        ],
        shippingAddress: sampleShippingAddress,
        subtotal: 40,
        tax: 0,
        shipping: 0,
        totalPrice: 40,
      };

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(400);

      // productA's stock should have been rolled back to its original value
      const restoredProductA = await prisma.product.findUnique({ where: { id: productA.id } });
      expect(restoredProductA?.stock).toBe(5);

      const noOrdersCreated = await prisma.order.count();
      expect(noOrdersCreated).toBe(0);
    });

    it("clears the user's cart after a successful order", async () => {
      const { token } = await registerAndGetToken();
      const product = await prisma.product.create({
        data: {
        name: "Mug",
        description: "A mug",
        price: 15,
        category: "Home",
        stock: 10,
      },
      });

      await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product.id, quantity: 2 });

      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(buildOrderPayload(product, 2));

      const cartRes = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(cartRes.body.items).toEqual([]);
    });
  });

  describe("GET /api/orders/myorders", () => {
    it("returns only the logged-in user's own orders", async () => {
      const userA = await registerAndGetToken();
      const userB = await registerAndGetToken();
      const product = await prisma.product.create({
        data: {
        name: "Notebook",
        description: "d",
        price: 5,
        category: "Office",
        stock: 20,
      },
      });

      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userA.token}`)
        .send(buildOrderPayload(product, 1));
      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userB.token}`)
        .send(buildOrderPayload(product, 1));

      const res = await request(app)
        .get("/api/orders/myorders")
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].user).toBe(userA.userId);
    });
  });

  describe("GET /api/orders (admin only)", () => {
    it("rejects a customer trying to list all orders", async () => {
      const { token } = await registerAndGetToken("customer");

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it("allows an admin to list every order across all users", async () => {
      const customer = await registerAndGetToken("customer");
      const admin = await registerAndGetToken("admin");
      const product = await prisma.product.create({
        data: {
        name: "Lamp",
        description: "d",
        price: 30,
        category: "Home",
        stock: 20,
      },
      });

      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customer.token}`)
        .send(buildOrderPayload(product, 1));

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].user.email).toBeDefined(); // populated
    });
  });

  describe("PUT /api/orders/:id/status (admin only)", () => {
    it("rejects a customer trying to update order status", async () => {
      const customer = await registerAndGetToken("customer");
      const product = await prisma.product.create({
        data: {
        name: "Chair",
        description: "d",
        price: 80,
        category: "Home",
        stock: 5,
      },
      });

      const orderRes = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customer.token}`)
        .send(buildOrderPayload(product, 1));

      const res = await request(app)
        .put(`/api/orders/${orderRes.body._id}/status`)
        .set("Authorization", `Bearer ${customer.token}`)
        .send({ status: "Shipped" });

      expect(res.status).toBe(403);
    });

    it("allows an admin to update order status to a valid value", async () => {
      const customer = await registerAndGetToken("customer");
      const admin = await registerAndGetToken("admin");
      const product = await prisma.product.create({
        data: {
        name: "Desk",
        description: "d",
        price: 150,
        category: "Home",
        stock: 5,
      },
      });

      const orderRes = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customer.token}`)
        .send(buildOrderPayload(product, 1));

      const res = await request(app)
        .put(`/api/orders/${orderRes.body._id}/status`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ status: "Shipped" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("Shipped");
    });

    it("rejects an invalid status value", async () => {
      const customer = await registerAndGetToken("customer");
      const admin = await registerAndGetToken("admin");
      const product = await prisma.product.create({
        data: {
        name: "Rug",
        description: "d",
        price: 60,
        category: "Home",
        stock: 5,
      },
      });

      const orderRes = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customer.token}`)
        .send(buildOrderPayload(product, 1));

      const res = await request(app)
        .put(`/api/orders/${orderRes.body._id}/status`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ status: "Cancelled" }); // not in the valid enum

      expect(res.status).toBe(400);
    });

    it("returns 404 for a non-existent order id", async () => {
      const admin = await registerAndGetToken("admin");

      const res = await request(app)
        .put(`/api/orders/${NON_EXISTENT_ID}/status`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ status: "Shipped" });

      expect(res.status).toBe(404);
    });
  });
});
