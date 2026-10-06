import * as service from "../services/health.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const health = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.check() });
});
