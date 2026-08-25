import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Extend Express's Request type to include our "user" property
export interface AuthRequest extends Request {
  user?: AuthUser;
}

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Middleware: verifies the JWT and attaches the user to req.user
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      // Header looks like: "Bearer eyJhbGciOiJIUzI1NiIs..."
      token = authHeader.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as DecodedToken;

      // Attach the user (minus password) to the request object
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!user) {
        res
          .status(401)
          .json({ message: "User not found, authorization denied" });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Middleware: only allows admins through (must be used AFTER `protect`)
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};
