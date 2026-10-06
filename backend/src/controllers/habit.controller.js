import * as service from "../services/habit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId, parseDate } from "../utils/params.js";

export const list = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { habits: await service.list(req.user.id) },
  });
});

export const create = asyncHandler(async (req, res) => {
  const habit = await service.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: { habit } });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: null });
});

export const setLog = asyncHandler(async (req, res) => {
  const habit = await service.setLog(
    req.user.id,
    parseId(req.params.id),
    parseDate(req.params.date),
    req.body.done,
  );
  res.json({ success: true, data: { habit } });
});
