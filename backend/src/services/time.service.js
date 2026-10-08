import * as repo from "../repositories/time.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const list = (userId) => repo.listRecent(userId);

export const create = async (userId, data) => {
  if (
    data.projectId != null &&
    !(await repo.projectOwned(userId, data.projectId))
  ) {
    throw new ApiError(400, "Project not found");
  }
  if (data.taskId != null && !(await repo.taskOwned(userId, data.taskId))) {
    throw new ApiError(400, "Task not found");
  }
  const id = await repo.create(userId, data);
  return repo.findById(userId, id);
};

export const remove = async (userId, id) => {
  const removed = await repo.remove(userId, id);
  if (!removed) throw new ApiError(404, "Time entry not found");
};
