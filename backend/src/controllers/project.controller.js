import * as service from "../services/project.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/params.js";

export const list = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { projects: await service.list(req.user.id) },
  });
});

export const get = asyncHandler(async (req, res) => {
  const project = await service.get(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: { project } });
});

export const create = asyncHandler(async (req, res) => {
  const project = await service.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: { project } });
});

export const update = asyncHandler(async (req, res) => {
  const project = await service.update(
    req.user.id,
    parseId(req.params.id),
    req.body,
  );
  res.json({ success: true, data: { project } });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: null });
});
