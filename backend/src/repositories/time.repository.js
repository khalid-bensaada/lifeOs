import { pool } from "../config/db.js";

const toEntry = (r) => ({
  id: r.id,
  category: r.category,
  title: r.title,
  projectId: r.project_id,
  taskId: r.task_id,
  date: r.entry_date,
  seconds: r.duration_sec,
  note: r.note || "",
});

export const listRecent = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM time_entries
     WHERE user_id = :userId AND entry_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
     ORDER BY entry_date DESC, id DESC`,
    { userId },
  );
  return rows.map(toEntry);
};

export const findById = async (userId, id) => {
  const [rows] = await pool.query(
    "SELECT * FROM time_entries WHERE id = :id AND user_id = :userId",
    {
      id,
      userId,
    },
  );
  return rows[0] ? toEntry(rows[0]) : null;
};

export const create = async (userId, d) => {
  const [result] = await pool.query(
    `INSERT INTO time_entries (user_id, project_id, task_id, category, title, entry_date, duration_sec, note)
     VALUES (:userId, :projectId, :taskId, :category, :title, :date, :seconds, :note)`,
    {
      userId,
      projectId: d.projectId ?? null,
      taskId: d.taskId ?? null,
      category: d.category,
      title: d.title,
      date: d.date,
      seconds: d.seconds,
      note: d.note || null,
    },
  );
  return result.insertId;
};

export const remove = async (userId, id) => {
  const [result] = await pool.query(
    "DELETE FROM time_entries WHERE id = :id AND user_id = :userId",
    {
      id,
      userId,
    },
  );
  return result.affectedRows;
};

export const projectOwned = async (userId, projectId) => {
  const [rows] = await pool.query(
    "SELECT 1 FROM projects WHERE id = :projectId AND user_id = :userId",
    {
      projectId,
      userId,
    },
  );
  return rows.length > 0;
};

export const taskOwned = async (userId, taskId) => {
  const [rows] = await pool.query(
    "SELECT 1 FROM tasks WHERE id = :taskId AND user_id = :userId",
    {
      taskId,
      userId,
    },
  );
  return rows.length > 0;
};
