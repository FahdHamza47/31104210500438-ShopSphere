import { Request, Response, NextFunction } from "express";
import { notFound, errorHandler } from "../../middleware/errorMiddleware";

// These are pure Express middleware functions, so we test them with
// lightweight mock req/res/next objects instead of spinning up a server
// or database — a true unit test, isolated from the rest of the app.

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.statusCode = 200;
  return res;
};

describe("errorMiddleware", () => {
  describe("notFound", () => {
    it("sets a 404 status and forwards an error describing the missing route", () => {
      const req = { originalUrl: "/api/does-not-exist" } as Request;
      const res = mockResponse();
      const next = jest.fn() as NextFunction;

      notFound(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).toHaveBeenCalledTimes(1);

      const forwardedError = (next as jest.Mock).mock.calls[0][0] as Error;
      expect(forwardedError).toBeInstanceOf(Error);
      expect(forwardedError.message).toBe(
        "Route not found - /api/does-not-exist",
      );
    });
  });

  describe("errorHandler", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("defaults to a 500 status when the response status is still 200", () => {
      const req = {} as Request;
      const res = mockResponse();
      res.statusCode = 200;
      const next = jest.fn() as NextFunction;
      const err = new Error("Something broke");

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Something broke" }),
      );
    });

    it("preserves a status code that was already set on the response", () => {
      const req = {} as Request;
      const res = mockResponse();
      res.statusCode = 404;
      const next = jest.fn() as NextFunction;
      const err = new Error("Not found");

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("hides the stack trace in production", () => {
      process.env.NODE_ENV = "production";
      const req = {} as Request;
      const res = mockResponse();
      const next = jest.fn() as NextFunction;

      errorHandler(new Error("boom"), req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ stack: null }),
      );
    });

    it("includes the stack trace outside production", () => {
      process.env.NODE_ENV = "development";
      const req = {} as Request;
      const res = mockResponse();
      const next = jest.fn() as NextFunction;

      errorHandler(new Error("boom"), req, res, next);

      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload.stack).not.toBeNull();
    });
  });
});
