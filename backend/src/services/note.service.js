import * as repo from "../repositories/note.repository.js";
import { ApiError } from "../utils/ApiError.js";

const mustFind = async (userId, id) => {
  const note = await repo.findById(userId, id);
  if (!note) throw new ApiError(404, "Note not found");
  return note;
};

const checkAttachment = async (userId, attachment) => {
  if (!attachment) return;
  if (!(await repo.targetOwned(userId, attachment.type, attachment.id))) {
    throw new ApiError(400, "The selected item was not found");
  }
};

export const list = (userId) => repo.listByUser(userId);

export const create = async (userId, data) => {
  await checkAttachment(userId, data.attachment);
  const id = await repo.create(userId, data.body, data.attachment ?? null);
  return repo.findById(userId, id);
};

export const update = async (userId, id, patch) => {
  await mustFind(userId, id);
  await checkAttachment(userId, patch.attachment);
  await repo.update(userId, id, patch);
  return repo.findById(userId, id);
};

export const remove = async (userId, id) => {
  const removed = await repo.remove(userId, id);
  if (!removed) throw new ApiError(404, "Note not found");
};
