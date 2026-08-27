import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";
import { serializeCart } from "../utils/serialize";

const includeProduct = { items: { include: { product: true } } } as const;

// @route  GET /api/cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: includeProduct,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: includeProduct,
      });
    }

    res.json(serializeCart(cart));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  POST /api/cart  Body: { productId, quantity }
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.stock < Number(quantity)) {
      res.status(400).json({ message: "Not enough stock available" });
      return;
    }

    const cart = await prisma.cart.upsert({
      where: { userId: req.user!.id },
      update: {},
      create: { userId: req.user!.id },
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + Number(quantity) },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: Number(quantity) },
      });
    }

    const populatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: includeProduct,
    });
    res.status(200).json(serializeCart(populatedCart!));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  PUT /api/cart/:productId  Body: { quantity }
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params as { productId: string };

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const item = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    if (!item) {
      res.status(404).json({ message: "Item not found in cart" });
      return;
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: Number(quantity) },
    });

    const populatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: includeProduct,
    });
    res.json(serializeCart(populatedCart!));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  DELETE /api/cart/:productId
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params as { productId: string };

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });

    const populatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: includeProduct,
    });
    res.json(serializeCart(populatedCart!));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  DELETE /api/cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
