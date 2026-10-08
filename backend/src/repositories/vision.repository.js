import { pool } from "../config/db.js";

const EMPTY = {
  oneYear: "",
  threeYear: "",
  skills: "",
  projects: "",
  habits: "",
};

const toVision = (r) => ({
  oneYear: r.one_year || "",
  threeYear: r.three_year || "",
  skills: r.skills || "",
  projects: r.projects || "",
  habits: r.habits || "",
});

export const get = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM life_vision WHERE user_id = :userId",
    { userId },
  );
  return rows[0] ? toVision(rows[0]) : { ...EMPTY };
};

export const save = async (userId, d) => {
  await pool.query(
    `INSERT INTO life_vision (user_id, one_year, three_year, skills, projects, habits)
     VALUES (:userId, :oneYear, :threeYear, :skills, :projects, :habits)
     ON DUPLICATE KEY UPDATE
       one_year = :oneYear, three_year = :threeYear, skills = :skills,
       projects = :projects, habits = :habits`,
    { userId, ...d },
  );
};
