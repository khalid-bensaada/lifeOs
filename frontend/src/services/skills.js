import { api } from "./api";

export const list = async () => (await api("/skills")).skills;

export const create = async ({ name, category }) =>
  (await api("/skills", { method: "POST", body: { name, category } })).skill;

export const remove = (id) => api(`/skills/${id}`, { method: "DELETE" });

export const addMilestone = async (id, level, title) =>
  (
    await api(`/skills/${id}/levels/${level}/milestones`, {
      method: "POST",
      body: { title },
    })
  ).skill;

export const setMilestone = async (id, milestoneId, done) =>
  (
    await api(`/skills/${id}/milestones/${milestoneId}`, {
      method: "PATCH",
      body: { done },
    })
  ).skill;

export const addPractice = async (id, title) =>
  (await api(`/skills/${id}/practice`, { method: "POST", body: { title } }))
    .skill;

export const setPractice = async (id, practiceId, done) =>
  (
    await api(`/skills/${id}/practice/${practiceId}`, {
      method: "PATCH",
      body: { done },
    })
  ).skill;
