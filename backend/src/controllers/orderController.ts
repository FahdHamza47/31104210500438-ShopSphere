import { Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

interface IncomingOrderItem {
  product: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface ShippingAddressPayload {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

// @route  POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      orderItems,
      shippingAddress,
      subtotal,
      tax,
      shipping,
      totalPrice,
    }: {
      orderItems: IncomingOrderItem[];
      shippingAddress: ShippingAddressPayload;
      subtotal: number;
      tax: number;
      shipping: number;
      totalPrice: number;
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: "No order items provided" });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        const result = await tx.product.updateMany({
          where: { id: item.product, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          throw new OrderError(
            `Insufficient stock for "${item.name}". Please update your cart and try again.`,
          );
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          shippingFullName: shippingAddress.fullName,
          shippingAddress: shippingAddress.address,
          shippingCity: shippingAddress.city,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
          shippingPhone: shippingAddress.phone,
          subtotal,
          tax,
          shipping,
          totalPrice,
          items: {
            create: orderItems.map((item) => ({
              productId: item.product,
              name: item.name,
              image: item.image || "",
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      const cart = await tx.cart.findUnique({
        where: { userId: req.user!.id },
      });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return createdOrder;
    });

    res.status(201).json(serializeOrder(order));
  } catch (error) {
    if (error instanceof OrderError) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  GET /api/orders/myorders
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders.map(serializeOrder));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  GET /api/orders (Admin only)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(
      orders.map((o) => ({
        ...serializeOrder(o),
        user: { _id: o.userId, name: o.user.name, email: o.user.email },
      })),
    );
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  PUT /api/orders/:id/status (Admin only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered"];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const { id } = req.params as { id: string };

    const existing = await prisma.order.findUnique({
      where: { id },
    });
    if (!existing) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    res.json(serializeOrder(order));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};

class OrderError extends Error {}

function serializeOrder(
  order: Prisma.OrderGetPayload<{ include: { items: true } }>,
) {
  return {
    _id: order.id,
    user: order.userId,
    status: order.status,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    shippingAddress: {
      fullName: order.shippingFullName,
      address: order.shippingAddress,
      city: order.shippingCity,
      postalCode: order.shippingPostalCode,
      country: order.shippingCountry,
      phone: order.shippingPhone,
    },
    orderItems: order.items.map((item) => ({
      _id: item.id,
      product: item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
  };
}
