import * as repo from "../repositories/task.repository.js";
import { ApiError } from "../utils/ApiError.js";

const mustFind = async (userId, id) => {
  const task = await repo.findById(userId, id);
  if (!task) throw new ApiError(404, "Task not found");
  return task;
};

const checkProject = async (userId, projectId) => {
  if (projectId == null) return;
  if (!(await repo.projectOwned(userId, projectId)))
    throw new ApiError(400, "Project not found");
};

const checkLimit = async (userId) => {
  const [limit, count] = await Promise.all([
    repo.dailyLimit(userId),
    repo.countToday(userId),
  ]);
  if (count >= limit) {
    throw new ApiError(
      400,
      `Today is limited to ${limit} priorities. Remove one first.`,
    );
  }
};

export const list = (userId) => repo.listByUser(userId);

export const get = (userId, id) => mustFind(userId, id);

export const create = async (userId, data) => {
  await checkProject(userId, data.projectId);
  const id = await repo.create(userId, data);
  return repo.findById(userId, id);
};

export const update = async (userId, id, patch) => {
  const task = await mustFind(userId, id);
  await checkProject(userId, patch.projectId);
  if (patch.today === true && !task.today) await checkLimit(userId);
  await repo.update(userId, id, patch);
  return repo.findById(userId, id);
};

export const remove = async (userId, id) => {
  const removed = await repo.remove(userId, id);
  if (!removed) throw new ApiError(404, "Task not found");
};
