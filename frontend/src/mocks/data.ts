import { Product, Cart } from "../types";

export const mockProducts: Product[] = [
  {
    _id: "prod1",
    name: "Classic Leather Sneakers",
    description: "Premium leather sneakers with a minimalist silhouette.",
    price: 89.99,
    category: "Footwear",
    brand: "Urbanist",
    stock: 25,
    images: ["/uploads/sneakers.jpg"],
    rating: 4.5,
    numReviews: 12,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "prod2",
    name: "Merino Wool Sweater",
    description: "Soft, breathable merino wool sweater.",
    price: 64.5,
    category: "Clothing",
    brand: "Northfield",
    stock: 0,
    images: ["/uploads/sweater.jpg"],
    rating: 4.7,
    numReviews: 8,
    createdAt: "2024-01-02T00:00:00.000Z",
  },
];

export const mockCart: Cart = {
  _id: "cart1",
  user: "user1",
  items: [
    {
      _id: "item1",
      product: mockProducts[0],
      quantity: 2,
    },
  ],
};

export const mockUser = {
  _id: "user1",
  name: "Jane Doe",
  email: "jane@example.com",
  role: "customer" as const,
  token: "mock-jwt-token",
};

export const mockOrder = {
  _id: "order1",
  user: mockUser._id,
  orderItems: [
    {
      product: mockProducts[0]._id,
      name: mockProducts[0].name,
      image: mockProducts[0].images[0],
      price: mockProducts[0].price,
      quantity: 2,
    },
  ],
  shippingAddress: {
    fullName: "Jane Doe",
    address: "123 Main St",
    city: "Springfield",
    postalCode: "12345",
    country: "USA",
    phone: "555-0100",
  },
  subtotal: 179.98,
  tax: 14.4,
  shipping: 0,
  totalPrice: 194.38,
  status: "Pending" as const,
  createdAt: "2024-06-01T00:00:00.000Z",
};
