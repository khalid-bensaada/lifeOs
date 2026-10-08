import * as service from "../services/skill.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId, parseLevel } from "../utils/params.js";

const ok = (res, skill, status = 200) =>
  res.status(status).json({ success: true, data: { skill } });

export const list = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { skills: await service.list(req.user.id) },
  });
});

export const create = asyncHandler(async (req, res) => {
  ok(res, await service.create(req.user.id, req.body), 201);
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, parseId(req.params.id));
  res.json({ success: true, data: null });
});

export const addMilestone = asyncHandler(async (req, res) => {
  const skill = await service.addMilestone(
    req.user.id,
    parseId(req.params.id),
    parseLevel(req.params.level),
    req.body.title,
  );
  ok(res, skill, 201);
});

export const setMilestone = asyncHandler(async (req, res) => {
  const skill = await service.setMilestone(
    req.user.id,
    parseId(req.params.id),
    parseId(req.params.milestoneId),
    req.body.done,
  );
  ok(res, skill);
});

export const addPractice = asyncHandler(async (req, res) => {
  ok(
    res,
    await service.addPractice(
      req.user.id,
      parseId(req.params.id),
      req.body.title,
    ),
    201,
  );
});

export const setPractice = asyncHandler(async (req, res) => {
  const skill = await service.setPractice(
    req.user.id,
    parseId(req.params.id),
    parseId(req.params.practiceId),
    req.body.done,
  );
  ok(res, skill);
});
