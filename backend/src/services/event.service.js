import * as repo from "../repositories/event.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const list = (userId) => repo.listByUser(userId);

export const create = async (userId, data) => {
  const id = await repo.create(userId, data);
  return repo.findById(userId, id);
};

export const update = async (userId, id, patch) => {
  const current = await repo.findById(userId, id);
  if (!current) throw new ApiError(404, "Event not found");

  const start = "start" in patch ? patch.start : current.start;
  const end = "end" in patch ? patch.end : current.end;
  if (start && end && end <= start)
    throw new ApiError(400, "End time must be after start time");

  await repo.update(userId, id, patch);
  return repo.findById(userId, id);
};

export const remove = async (userId, id) => {
  const removed = await repo.remove(userId, id);
  if (!removed) throw new ApiError(404, "Event not found");
};
