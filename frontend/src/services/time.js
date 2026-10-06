import { api } from "./api";

const toBody = (entry) => {
  const n = Number(entry.projectId);
  return { ...entry, projectId: Number.isInteger(n) && n > 0 ? n : null };
};

export const list = async () => (await api("/time")).entries;

export const create = async (entry) =>
  (await api("/time", { method: "POST", body: toBody(entry) })).entry;

export const remove = (id) => api(`/time/${id}`, { method: "DELETE" });
