import { api } from "./api";

const toAttachment = (a) => (a ? { type: a.type, id: Number(a.id) } : null);

export const list = async () => (await api("/notes")).notes;

export const create = async ({ body, attachment }) =>
  (
    await api("/notes", {
      method: "POST",
      body: { body, attachment: toAttachment(attachment) },
    })
  ).note;

export const update = async (id, { body, attachment }) =>
  (
    await api(`/notes/${id}`, {
      method: "PUT",
      body: { body, attachment: toAttachment(attachment) },
    })
  ).note;

export const remove = (id) => api(`/notes/${id}`, { method: "DELETE" });
