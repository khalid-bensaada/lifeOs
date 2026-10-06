import { api } from "./api";

export const list = async () => (await api("/events")).events;

export const create = async ({ title, date, start, end }) =>
  (
    await api("/events", {
      method: "POST",
      body: { title, date, start: start || null, end: end || null },
    })
  ).event;

export const remove = (id) => api(`/events/${id}`, { method: "DELETE" });
