import * as service from "../services/task.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/params.js";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { tasks: await service.list(req.user.id) } });
});

export const get = asyncHandler(async (req, res) => {
  const task = await service.get(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: { task } });
});

export const create = asyncHandler(async (req, res) => {
  const task = await service.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: { task } });
});

export const update = asyncHandler(async (req, res) => {
  const task = await service.update(
    req.user.id,
    parseId(req.params.id),
    req.body,
  );
  res.json({ success: true, data: { task } });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: null });
});
