import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { uploadBufferToCloudinary } from "../utils/cloudinary";
import { serializeProduct } from "../utils/serialize";

// @route  GET /api/products/categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const rows = await prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
    });
    res.json(rows.map((r) => r.category));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route   GET /api/products
// Supports: ?keyword=shirt&category=Clothing&minPrice=10&maxPrice=100
//           &sort=price_asc&page=1&limit=8
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;

    const where: Prisma.ProductWhereInput = {};

    if (req.query.keyword) {
      where.name = {
        contains: req.query.keyword as string,
        mode: "insensitive", // case-insensitive search
      };
    }

    if (req.query.category) {
      where.category = req.query.category as string;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {
        ...(req.query.minPrice ? { gte: Number(req.query.minPrice) } : {}),
        ...(req.query.maxPrice ? { lte: Number(req.query.maxPrice) } : {}),
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" }; // newest first, default
    switch (req.query.sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "rating_desc":
        orderBy = { rating: "desc" };
        break;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      products: products.map(serializeProduct),
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route   GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(serializeProduct(product));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route   POST /api/products (Admin only)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, brand, stock } = req.body;

    const files = (req as any).files as Array<{ buffer: Buffer }> | undefined;
    const images =
      files && files.length > 0
        ? await Promise.all(
            files.map((file) => uploadBufferToCloudinary(file.buffer)),
          )
        : [];

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        category,
        brand: brand || "Generic",
        stock: Number(stock) || 0,
        images,
      },
    });

    res.status(201).json(serializeProduct(product));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route   PUT /api/products/:id (Admin only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const { name, description, price, category, brand, stock } = req.body;

    let images = existing.images;
    const files = (req as any).files as Array<{ buffer: Buffer }> | undefined;
    if (files && files.length > 0) {
      const newImages = await Promise.all(
        files.map((file) => uploadBufferToCloudinary(file.buffer)),
      );
      images = [...existing.images, ...newImages];
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name ?? existing.name,
        description: description ?? existing.description,
        price: price !== undefined ? Number(price) : existing.price,
        category: category ?? existing.category,
        brand: brand ?? existing.brand,
        stock: stock !== undefined ? Number(stock) : existing.stock,
        images,
      },
    });

    res.json(serializeProduct(updatedProduct));
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route   DELETE /api/products/:id (Admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
