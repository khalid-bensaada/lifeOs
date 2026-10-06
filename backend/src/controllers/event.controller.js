import * as service from "../services/event.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/params.js";

export const list = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { events: await service.list(req.user.id) },
  });
});

export const create = asyncHandler(async (req, res) => {
  const event = await service.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: { event } });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: null });
});
