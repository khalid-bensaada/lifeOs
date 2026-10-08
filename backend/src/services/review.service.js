import * as repo from "../repositories/review.repository.js";

export const list = (userId) => repo.listByUser(userId);

export const save = async (userId, weekStart, data) => {
  const priorities = [...new Set(data.priorities)];
  await repo.save(userId, weekStart, { ...data, priorities });
  return repo.findByWeek(userId, weekStart);
};
