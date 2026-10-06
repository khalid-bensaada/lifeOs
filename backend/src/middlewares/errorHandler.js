import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) =>
  next(new ApiError(404, "Route not found"));

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ success: false, error: { message: err.message } });
  }
  console.error(err);
  res.status(500).json({
    success: false,
    error: { message: "Something went wrong. Please try again." },
  });
};
