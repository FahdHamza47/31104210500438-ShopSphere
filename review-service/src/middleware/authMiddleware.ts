import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// This service has no users table of its own — it trusts JWTs issued by
// the MAIN ShopSphere backend, verified here using the same JWT_SECRET
// (set as an identical env var on both deployments). This is the standard
// "shared secret" pattern for a service that needs to know *who* is
// calling without owning the user data itself.

export interface AuthUser {
  id: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401).json({ message: "Not authorized, no token provided" });
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
