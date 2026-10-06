import { pool } from "../config/db.js";

const COLUMNS = {
  title: "title",
  description: "description",
  status: "status",
  tech: "tech",
  goalId: "goal_id",
  deadline: "deadline",
};

const toProject = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  status: r.status,
  tech: r.tech,
  goalId: r.goal_id,
  deadline: r.deadline,
});

export const listByUser = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM projects WHERE user_id = :userId ORDER BY created_at DESC, id DESC",
    { userId },
  );
  return rows.map(toProject);
};

export const findById = async (userId, id) => {
  const [rows] = await pool.query(
    "SELECT * FROM projects WHERE id = :id AND user_id = :userId",
    { id, userId },
  );
  return rows[0] ? toProject(rows[0]) : null;
};

export const create = async (userId, d) => {
  const [result] = await pool.query(
    `INSERT INTO projects (user_id, goal_id, title, description, status, tech, deadline)
     VALUES (:userId, :goalId, :title, :description, :status, :tech, :deadline)`,
    {
      userId,
      goalId: d.goalId ?? null,
      title: d.title,
      description: d.description ?? null,
      status: d.status ?? "idea",
      tech: d.tech ?? "",
      deadline: d.deadline ?? null,
    },
  );
  return result.insertId;
};

export const update = async (userId, id, patch) => {
  const keys = Object.keys(patch).filter((k) => k in COLUMNS);
  if (!keys.length) return;
  const set = keys.map((k) => `${COLUMNS[k]} = :${k}`).join(", ");
  await pool.query(
    `UPDATE projects SET ${set} WHERE id = :id AND user_id = :userId`,
    { ...patch, id, userId },
  );
};

export const remove = async (userId, id) => {
  const [result] = await pool.query(
    "DELETE FROM projects WHERE id = :id AND user_id = :userId",
    { id, userId },
  );
  return result.affectedRows;
};

export const goalOwned = async (userId, goalId) => {
  const [rows] = await pool.query(
    "SELECT 1 FROM goals WHERE id = :goalId AND user_id = :userId",
    {
      goalId,
      userId,
    },
  );
  return rows.length > 0;
};
