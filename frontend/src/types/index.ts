// Mirrors our backend's User model (minus password, obviously)
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  token: string;
}

// Mirrors our backend's Product model
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  images: string[];
  rating: number;
  numReviews: number;
  createdAt: string;
}

// Shape of the paginated response from GET /api/products
export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

// One item inside a cart
export interface CartItem {
  _id: string;
  product: Product; // populated by the backend
  quantity: number;
}

// The full cart object returned by GET /api/cart
export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

// Query params we can send to GET /api/products
export interface ProductQueryParams {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

// One line item inside a placed order
export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

// Shipping details captured at checkout
export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Populated user object attached to orders in admin views
export interface OrderUser {
  _id: string;
  name: string;
  email: string;
}

// Mirrors our backend's Order model
export interface Order {
  _id: string;
  user: OrderUser | string; // populated object for admin views, plain ID string elsewhere
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shipping: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}
