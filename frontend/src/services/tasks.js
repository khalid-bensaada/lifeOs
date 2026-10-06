import { api } from "./api";

const toBody = (task) => {
  const body = { ...task };
  if ("projectId" in body) {
    const n = Number(body.projectId);
    body.projectId = Number.isInteger(n) && n > 0 ? n : null;
  }
  return body;
};

export const list = async () => (await api("/tasks")).tasks;

export const create = async (task) =>
  (await api("/tasks", { method: "POST", body: toBody(task) })).task;

export const update = async (id, patch) =>
  (await api(`/tasks/${id}`, { method: "PUT", body: toBody(patch) })).task;

export const remove = (id) => api(`/tasks/${id}`, { method: "DELETE" });
