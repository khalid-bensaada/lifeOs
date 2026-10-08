import { api } from "./api";

export const get = async () => (await api("/settings")).settings;

export const update = async (patch) =>
  (await api("/settings", { method: "PUT", body: patch })).settings;
