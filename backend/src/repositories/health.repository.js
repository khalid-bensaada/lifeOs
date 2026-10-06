import { pool } from "../config/db.js";

export const ping = async () => {
  await pool.query("SELECT 1");
};
