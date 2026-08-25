import api from "./api";
import type { Cart } from "../types";

// GET /api/cart
export const fetchCart = async (): Promise<Cart> => {
  const response = await api.get<Cart>("/cart");
  return response.data;
};

// POST /api/cart
export const addItemToCart = async (
  productId: string,
  quantity: number,
): Promise<Cart> => {
  const response = await api.post<Cart>("/cart", { productId, quantity });
  return response.data;
};

// PUT /api/cart/:productId
export const updateCartItemQty = async (
  productId: string,
  quantity: number,
): Promise<Cart> => {
  const response = await api.put<Cart>(`/cart/${productId}`, { quantity });
  return response.data;
};

// DELETE /api/cart/:productId
export const removeItemFromCart = async (productId: string): Promise<Cart> => {
  const response = await api.delete<Cart>(`/cart/${productId}`);
  return response.data;
};

// DELETE /api/cart
export const clearCart = async (): Promise<void> => {
  await api.delete("/cart");
};
