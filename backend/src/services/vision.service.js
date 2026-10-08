import * as repo from "../repositories/vision.repository.js";

export const get = (userId) => repo.get(userId);

export const save = async (userId, data) => {
  await repo.save(userId, data);
  return repo.get(userId);
};
