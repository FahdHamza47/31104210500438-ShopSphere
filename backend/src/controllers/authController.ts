import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db";
import generateToken from "../utils/generateToken";
import { AuthRequest } from "../middleware/authMiddleware";

// @route  POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const userExists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (userExists) {
      res
        .status(400)
        .json({ message: "A user with this email already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // role is intentionally NOT taken from req.body — everyone who
    // registers becomes a 'customer'. Admins are created manually/seeded.
    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashedPassword },
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  POST /api/auth/login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: String(email ?? "").toLowerCase().trim() },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @route  GET /api/auth/profile
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  // req.user was attached by the `protect` middleware
  res.json(req.user);
};
