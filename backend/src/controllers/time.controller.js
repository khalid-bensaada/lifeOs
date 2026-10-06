import * as service from "../services/time.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/params.js";

export const list = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { entries: await service.list(req.user.id) },
  });
});

export const create = asyncHandler(async (req, res) => {
  const entry = await service.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: { entry } });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: null });
});
