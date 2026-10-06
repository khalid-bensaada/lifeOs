import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as auth from "../services/auth.service.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) throw new ApiError(401, "Please log in to continue");

  let payload;
  try {
    payload = auth.verifyToken(token);
  } catch {
    throw new ApiError(401, "Your session has expired. Please log in again.");
  }

  const user = await auth.getUser(payload.sub);
  if (!user) throw new ApiError(401, "Please log in to continue");

  req.user = user;
  next();
});
