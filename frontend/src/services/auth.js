import { api } from "./api";

export const me = async () => (await api("/auth/me")).user;
export const login = async (body) =>
  (await api("/auth/login", { method: "POST", body })).user;
export const register = async (body) =>
  (await api("/auth/register", { method: "POST", body })).user;
export const logout = () => api("/auth/logout", { method: "POST" });
