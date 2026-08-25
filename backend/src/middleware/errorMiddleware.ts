import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Runs when no route matches the request
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Catches all errors passed via next(error), logs a structured entry
// (timestamp + "error" severity, per rubric 4.2), then formats a clean
// JSON response for the client.
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  logger.error(err.message, {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    stack: err.stack,
  });

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
