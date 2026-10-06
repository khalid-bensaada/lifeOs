import * as repo from "../repositories/project.repository.js";
import { ApiError } from "../utils/ApiError.js";

const mustFind = async (userId, id) => {
  const project = await repo.findById(userId, id);
  if (!project) throw new ApiError(404, "Project not found");
  return project;
};

const checkGoal = async (userId, goalId) => {
  if (goalId == null) return;
  if (!(await repo.goalOwned(userId, goalId)))
    throw new ApiError(400, "Goal not found");
};

export const list = (userId) => repo.listByUser(userId);

export const get = (userId, id) => mustFind(userId, id);

export const create = async (userId, data) => {
  await checkGoal(userId, data.goalId);
  const id = await repo.create(userId, data);
  return repo.findById(userId, id);
};

export const update = async (userId, id, patch) => {
  await mustFind(userId, id);
  await checkGoal(userId, patch.goalId);
  await repo.update(userId, id, patch);
  return repo.findById(userId, id);
};

export const remove = async (userId, id) => {
  const removed = await repo.remove(userId, id);
  if (!removed) throw new ApiError(404, "Project not found");
};
