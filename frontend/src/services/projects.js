import { api } from "./api";

const toBody = (project) => {
  const body = { ...project };
  if ("goalId" in body) {
    const n = Number(body.goalId);
    body.goalId = Number.isInteger(n) && n > 0 ? n : null;
  }
  return body;
};

export const list = async () => (await api("/projects")).projects;

export const create = async (project) =>
  (await api("/projects", { method: "POST", body: toBody(project) })).project;

export const update = async (id, patch) =>
  (await api(`/projects/${id}`, { method: "PUT", body: toBody(patch) }))
    .project;

export const remove = (id) => api(`/projects/${id}`, { method: "DELETE" });
