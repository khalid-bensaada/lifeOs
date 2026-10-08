import * as service from "../services/vision.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { vision: await service.get(req.user.id) } });
});

export const save = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { vision: await service.save(req.user.id, req.body) },
  });
});
