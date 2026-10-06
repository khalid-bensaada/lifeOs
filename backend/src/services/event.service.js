import * as repo from "../repositories/event.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const list = (userId) => repo.listByUser(userId);

export const create = async (userId, data) => {
  const id = await repo.create(userId, data);
  return repo.findById(userId, id);
};

export const remove = async (userId, id) => {
  const removed = await repo.remove(userId, id);
  if (!removed) throw new ApiError(404, "Event not found");
};
