import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Logs one structured entry per request, once it finishes. Severity is
// derived from the final status code: 5xx -> error, 4xx -> warn, else info.
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const fields = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    };

    if (res.statusCode >= 500) {
      logger.error("request completed", fields);
    } else if (res.statusCode >= 400) {
      logger.warn("request completed", fields);
    } else {
      logger.info("request completed", fields);
    }
  });

  next();
};
