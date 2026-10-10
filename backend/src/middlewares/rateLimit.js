import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const handler = (req, res, next) =>
  next(
    new ApiError(
      429,
      "Too many attempts. Please wait a few minutes and try again.",
      {
        code: "tooManyRequests",
      },
    ),
  );

const make = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler,
    ...options,
  });

export const apiLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: env.limits.api,
  skip: (req) => req.path === "/health",
});

export const loginLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: env.limits.login,
  skipSuccessfulRequests: true,
});

export const registerLimiter = make({
  windowMs: 60 * 60 * 1000,
  limit: env.limits.register,
});
