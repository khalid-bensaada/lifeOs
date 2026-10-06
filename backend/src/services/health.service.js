import * as repo from "../repositories/health.repository.js";

export const check = async () => {
  await repo.ping();
  return { status: "ok", database: "connected" };
};
