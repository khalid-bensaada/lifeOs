import { ApiError } from "../utils/ApiError.js";
import { codeOf } from "../utils/errorCodes.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues[0].message;
    return next(
      new ApiError(400, message, { code: codeOf(message) ?? "invalidInput" }),
    );
  }
  req.body = result.data;
  next();
};
