import * as repo from "../repositories/settings.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const get = (userId) => repo.get(userId);

export const update = async (userId, patch) => {
  const current = await repo.get(userId);
  const start = patch.workStart ?? current.workStart;
  const end = patch.workEnd ?? current.workEnd;
  if (end <= start)
    throw new ApiError(400, "Working hours must end after they start");

  await repo.update(userId, patch);
  return repo.get(userId);
};
