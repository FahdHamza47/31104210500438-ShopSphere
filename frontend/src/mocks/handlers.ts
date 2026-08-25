import { http, HttpResponse } from "msw";
import { mockProducts, mockCart, mockUser, mockOrder } from "./data";

const API_BASE = "http://localhost:5000/api";

export const handlers = [
  http.get(`${API_BASE}/products`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("keyword");

    let filtered = mockProducts;
    if (keyword) {
      filtered = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase()),
      );
    }

    return HttpResponse.json({
      products: filtered,
      page: 1,
      pages: 1,
      total: filtered.length,
    });
  }),

  http.get(`${API_BASE}/products/categories`, () => {
    return HttpResponse.json(["Footwear", "Clothing"]);
  }),

  http.get(`${API_BASE}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p._id === params.id);
    if (!product) {
      return HttpResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json(product);
  }),

  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === mockUser.email && body.password === "password123") {
      return HttpResponse.json(mockUser);
    }
    return HttpResponse.json(
      { message: "Invalid email or password" },
      { status: 401 },
    );
  }),

  http.post(`${API_BASE}/auth/register`, async () => {
    return HttpResponse.json(mockUser, { status: 201 });
  }),

  http.get(`${API_BASE}/cart`, () => {
    return HttpResponse.json(mockCart);
  }),

  http.post(`${API_BASE}/cart`, async () => {
    return HttpResponse.json(mockCart);
  }),

  http.put(`${API_BASE}/cart/:productId`, async ({ params, request }) => {
    const body = (await request.json()) as { quantity: number };
    const updatedItems = mockCart.items.map((item) =>
      item.product._id === params.productId
        ? { ...item, quantity: body.quantity }
        : item,
    );
    return HttpResponse.json({ ...mockCart, items: updatedItems });
  }),

  http.delete(`${API_BASE}/cart/:productId`, async ({ params }) => {
    const remainingItems = mockCart.items.filter(
      (item) => item.product._id !== params.productId,
    );
    return HttpResponse.json({ ...mockCart, items: remainingItems });
  }),

  http.delete(`${API_BASE}/cart`, () => {
    return HttpResponse.json({ message: "Cart cleared" });
  }),

  http.post(`${API_BASE}/orders`, async () => {
    return HttpResponse.json(mockOrder, { status: 201 });
  }),

  http.get(`${API_BASE}/orders/myorders`, () => {
    return HttpResponse.json([mockOrder]);
  }),
];
