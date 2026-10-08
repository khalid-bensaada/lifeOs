import { api } from "./api";

export const list = async () => (await api("/reviews")).reviews;

export const save = async (weekStart, { answers, priorities, stats }) =>
  (
    await api(`/reviews/${weekStart}`, {
      method: "PUT",
      body: { answers, priorities, stats },
    })
  ).review;
