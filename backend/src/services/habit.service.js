import * as repo from "../repositories/habit.repository.js";
import { ApiError } from "../utils/ApiError.js";

const mustFind = async (userId, id) => {
  const habit = await repo.findById(userId, id);
  if (!habit) throw new ApiError(404, "Habit not found");
  return habit;
};

export const list = (userId) => repo.listByUser(userId);

export const create = async (userId, data) => {
  const id = await repo.create(userId, data);
  return repo.findById(userId, id);
};

export const remove = async (userId, id) => {
  const removed = await repo.remove(userId, id);
  if (!removed) throw new ApiError(404, "Habit not found");
};

export const setLog = async (userId, id, date, done) => {
  await mustFind(userId, id);
  await repo.setLog(id, date, done);
  return repo.findById(userId, id);
};
