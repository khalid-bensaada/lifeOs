import * as repo from "../repositories/daily.repository.js";

export const list = (userId) => repo.listRecent(userId);

export const save = async (userId, date, data) => {
  await repo.save(userId, date, data);
  return repo.findByDate(userId, date);
};
