import * as repo from "../repositories/goal.repository.js";
import { ApiError } from "../utils/ApiError.js";

const mustFind = async (userId, id) => {
  const goal = await repo.findById(userId, id);
  if (!goal) throw new ApiError(404, "Goal not found");
  return goal;
};

const mustHaveMilestone = (goal, milestoneId) => {
  if (!goal.milestones.some((m) => m.id === milestoneId))
    throw new ApiError(404, "Milestone not found");
};

export const list = (userId) => repo.listByUser(userId);

export const get = (userId, id) => mustFind(userId, id);

export const create = async (userId, data) => {
  const id = await repo.create(userId, data);
  return repo.findById(userId, id);
};

export const update = async (userId, id, patch) => {
  await mustFind(userId, id);
  await repo.update(userId, id, patch);
  return repo.findById(userId, id);
};

export const remove = async (userId, id) => {
  const removed = await repo.remove(userId, id);
  if (!removed) throw new ApiError(404, "Goal not found");
};

export const addMilestone = async (userId, goalId, title) => {
  await mustFind(userId, goalId);
  await repo.addMilestone(goalId, title);
  return repo.findById(userId, goalId);
};

export const updateMilestone = async (userId, goalId, milestoneId, patch) => {
  const goal = await mustFind(userId, goalId);
  mustHaveMilestone(goal, milestoneId);
  await repo.updateMilestone(goalId, milestoneId, patch);
  return repo.findById(userId, goalId);
};

export const removeMilestone = async (userId, goalId, milestoneId) => {
  const goal = await mustFind(userId, goalId);
  mustHaveMilestone(goal, milestoneId);
  await repo.removeMilestone(goalId, milestoneId);
  return repo.findById(userId, goalId);
};
