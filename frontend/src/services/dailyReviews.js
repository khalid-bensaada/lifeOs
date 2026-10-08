import { api } from "./api";

export const list = async () => (await api("/daily-reviews")).reviews;

export const save = async (date, { wentWell, improve, tomorrowFirst }) =>
  (
    await api(`/daily-reviews/${date}`, {
      method: "PUT",
      body: { wentWell, improve, tomorrowFirst },
    })
  ).review;
