import { ApiError } from "../utils/ApiError.js";
import { codeOf } from "../utils/errorCodes.js";

const send = (res, status, message, code, params) =>
  res.status(status).json({ success: false, error: { message, code, params } });

export const notFound = (req, res, next) =>
  next(new ApiError(404, "Route not found"));

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return send(
      res,
      err.status,
      err.message,
      err.code ?? codeOf(err.message),
      err.params,
    );
  }
  if (err.type === "entity.too.large") {
    return send(res, 413, "The data you sent is too large.", "tooLarge");
  }
  if (err.type === "entity.parse.failed") {
    return send(
      res,
      400,
      "Some of the information you entered is not valid.",
      "invalidInput",
    );
  }

  console.error(err);
  send(res, 500, "Something went wrong. Please try again.", "generic");
};
