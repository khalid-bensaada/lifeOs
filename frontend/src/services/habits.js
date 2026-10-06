import { api } from "./api";

export const list = async () => (await api("/habits")).habits;

export const create = async ({ name, category }) =>
  (await api("/habits", { method: "POST", body: { name, category } })).habit;

export const remove = (id) => api(`/habits/${id}`, { method: "DELETE" });

export const setLog = (id, date, done) =>
  api(`/habits/${id}/logs/${date}`, { method: "PUT", body: { done } });
