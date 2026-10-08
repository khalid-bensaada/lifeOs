import { api } from "./api";

const validId = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const toBody = (entry) => ({
  category: entry.category,
  title: entry.title,
  projectId: validId(entry.projectId),
  taskId: validId(entry.taskId),
  date: entry.date,
  seconds: entry.seconds,
  note: entry.note ? entry.note.trim() : undefined,
});

export const list = async () => (await api("/time")).entries;

export const create = async (entry) =>
  (await api("/time", { method: "POST", body: toBody(entry) })).entry;

export const remove = (id) => api(`/time/${id}`, { method: "DELETE" });
