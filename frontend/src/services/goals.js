import { api } from "./api";

export const list = async () => (await api("/goals")).goals;

export const create = async ({ title, category, deadline }) =>
  (await api("/goals", { method: "POST", body: { title, category, deadline } }))
    .goal;

export const remove = (id) => api(`/goals/${id}`, { method: "DELETE" });

export const addMilestone = async (id, title) =>
  (await api(`/goals/${id}/milestones`, { method: "POST", body: { title } }))
    .goal;

export const updateMilestone = async (id, mid, body) =>
  (await api(`/goals/${id}/milestones/${mid}`, { method: "PATCH", body })).goal;
