import * as service from "../services/goal.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/params.js";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { goals: await service.list(req.user.id) } });
});

export const get = asyncHandler(async (req, res) => {
  const goal = await service.get(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: { goal } });
});

export const create = asyncHandler(async (req, res) => {
  const goal = await service.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: { goal } });
});

export const update = asyncHandler(async (req, res) => {
  const goal = await service.update(
    req.user.id,
    parseId(req.params.id),
    req.body,
  );
  res.json({ success: true, data: { goal } });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: null });
});

export const addMilestone = asyncHandler(async (req, res) => {
  const goal = await service.addMilestone(
    req.user.id,
    parseId(req.params.id),
    req.body.title,
  );
  res.status(201).json({ success: true, data: { goal } });
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const goal = await service.updateMilestone(
    req.user.id,
    parseId(req.params.id),
    parseId(req.params.milestoneId),
    req.body,
  );
  res.json({ success: true, data: { goal } });
});

export const removeMilestone = asyncHandler(async (req, res) => {
  const goal = await service.removeMilestone(
    req.user.id,
    parseId(req.params.id),
    parseId(req.params.milestoneId),
  );
  res.json({ success: true, data: { goal } });
});
