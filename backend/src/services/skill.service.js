import * as repo from "../repositories/skill.repository.js";
import { ApiError } from "../utils/ApiError.js";

const mustFind = async (userId, id) => {
  const skill = await repo.findById(userId, id);
  if (!skill) throw new ApiError(404, "Skill not found");
  return skill;
};

export const list = (userId) => repo.listByUser(userId);

export const create = async (userId, data) => {
  const id = await repo.create(userId, data);
  return repo.findById(userId, id);
};

export const remove = async (userId, id) => {
  const removed = await repo.remove(userId, id);
  if (!removed) throw new ApiError(404, "Skill not found");
};

export const addMilestone = async (userId, skillId, level, title) => {
  await mustFind(userId, skillId);
  await repo.addMilestone(skillId, level, title);
  return repo.findById(userId, skillId);
};

export const setMilestone = async (userId, skillId, milestoneId, done) => {
  const skill = await mustFind(userId, skillId);
  const exists = skill.levels.some((l) =>
    l.milestones.some((m) => m.id === milestoneId),
  );
  if (!exists) throw new ApiError(404, "Milestone not found");
  await repo.setMilestone(skillId, milestoneId, done);
  return repo.findById(userId, skillId);
};

export const addPractice = async (userId, skillId, title) => {
  await mustFind(userId, skillId);
  await repo.addPractice(skillId, title);
  return repo.findById(userId, skillId);
};

export const setPractice = async (userId, skillId, practiceId, done) => {
  const skill = await mustFind(userId, skillId);
  if (!skill.projects.some((p) => p.id === practiceId))
    throw new ApiError(404, "Practice project not found");
  await repo.setPractice(skillId, practiceId, done);
  return repo.findById(userId, skillId);
};
