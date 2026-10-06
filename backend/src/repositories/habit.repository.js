import { pool } from "../config/db.js";

const toHabit = (h, logs) => ({
  id: h.id,
  name: h.name,
  category: h.category,
  logs,
});

export const listByUser = async (userId) => {
  const [habits] = await pool.query(
    "SELECT * FROM habits WHERE user_id = :userId AND archived_at IS NULL ORDER BY created_at, id",
    { userId },
  );
  if (!habits.length) return [];

  const [rows] = await pool.query(
    `SELECT l.habit_id, l.log_date
     FROM habit_logs l
     JOIN habits h ON h.id = l.habit_id
     WHERE h.user_id = :userId AND h.archived_at IS NULL
     ORDER BY l.log_date`,
    { userId },
  );

  const byHabit = new Map();
  for (const r of rows) {
    if (!byHabit.has(r.habit_id)) byHabit.set(r.habit_id, []);
    byHabit.get(r.habit_id).push(r.log_date);
  }
  return habits.map((h) => toHabit(h, byHabit.get(h.id) || []));
};

export const findById = async (userId, id) => {
  const [rows] = await pool.query(
    "SELECT * FROM habits WHERE id = :id AND user_id = :userId AND archived_at IS NULL",
    { id, userId },
  );
  if (!rows[0]) return null;
  const [logs] = await pool.query(
    "SELECT log_date FROM habit_logs WHERE habit_id = :id ORDER BY log_date",
    { id },
  );
  return toHabit(
    rows[0],
    logs.map((l) => l.log_date),
  );
};

export const create = async (userId, { name, category }) => {
  const [result] = await pool.query(
    "INSERT INTO habits (user_id, name, category) VALUES (:userId, :name, :category)",
    { userId, name, category: category ?? "Personal" },
  );
  return result.insertId;
};

export const remove = async (userId, id) => {
  const [result] = await pool.query(
    "DELETE FROM habits WHERE id = :id AND user_id = :userId",
    {
      id,
      userId,
    },
  );
  return result.affectedRows;
};

export const setLog = async (habitId, date, done) => {
  if (done) {
    await pool.query(
      "INSERT IGNORE INTO habit_logs (habit_id, log_date) VALUES (:habitId, :date)",
      { habitId, date },
    );
  } else {
    await pool.query(
      "DELETE FROM habit_logs WHERE habit_id = :habitId AND log_date = :date",
      {
        habitId,
        date,
      },
    );
  }
};
