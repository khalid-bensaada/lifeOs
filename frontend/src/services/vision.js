import { api } from "./api";

export const get = async () => (await api("/vision")).vision;

export const save = async (vision) =>
  (await api("/vision", { method: "PUT", body: vision })).vision;
