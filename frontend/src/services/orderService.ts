import api from "./api";
import type { Order, OrderItem, ShippingAddress } from "../types";

interface CreateOrderPayload {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shipping: number;
  totalPrice: number;
}

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<Order> => {
  const { data } = await api.post<Order>("/orders", payload);
  return data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<Order[]>("/orders/myorders");
  return data;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<Order[]>("/orders");
  return data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
): Promise<Order> => {
  const { data } = await api.put<Order>(`/orders/${orderId}/status`, {
    status,
  });
  return data;
};
