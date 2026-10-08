import { api } from "./api";

const body = ({ title, date, start, end }) => ({
  title,
  date,
  start: start || null,
  end: end || null,
});

export const list = async () => (await api("/events")).events;

export const create = async (event) =>
  (await api("/events", { method: "POST", body: body(event) })).event;

export const update = async (id, { title, start, end }) =>
  (
    await api(`/events/${id}`, {
      method: "PUT",
      body: { title, start: start || null, end: end || null },
    })
  ).event;

export const remove = (id) => api(`/events/${id}`, { method: "DELETE" });
