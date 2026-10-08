import * as service from "../services/settings.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const get = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { settings: await service.get(req.user.id) },
  });
});

export const update = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { settings: await service.update(req.user.id, req.body) },
  });
});
