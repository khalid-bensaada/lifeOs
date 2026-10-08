import { pool } from "../config/db.js";

const COLUMN = {
  goal: "goal_id",
  project: "project_id",
  skill: "skill_id",
  task: "task_id",
  review: "review_id",
};

const FIELD = {
  goal: "goalId",
  project: "projectId",
  skill: "skillId",
  task: "taskId",
  review: "reviewId",
};

const TABLE = {
  goal: "goals",
  project: "projects",
  skill: "skills",
  task: "tasks",
  review: "weekly_reviews",
};

const params = (attachment) => ({
  goalId: null,
  projectId: null,
  skillId: null,
  taskId: null,
  reviewId: null,
  ...(attachment ? { [FIELD[attachment.type]]: attachment.id } : {}),
});

const toNote = (r) => {
  const type = Object.keys(COLUMN).find((t) => r[COLUMN[t]] != null);
  return {
    id: r.id,
    body: r.body,
    attachment: type ? { type, id: r[COLUMN[type]] } : null,
    createdAt: String(r.created_at),
  };
};

export const listByUser = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM notes WHERE user_id = :userId ORDER BY created_at DESC, id DESC LIMIT 500",
    { userId },
  );
  return rows.map(toNote);
};

export const findById = async (userId, id) => {
  const [rows] = await pool.query(
    "SELECT * FROM notes WHERE id = :id AND user_id = :userId",
    { id, userId },
  );
  return rows[0] ? toNote(rows[0]) : null;
};

export const create = async (userId, body, attachment) => {
  const [result] = await pool.query(
    `INSERT INTO notes (user_id, body, goal_id, project_id, skill_id, task_id, review_id)
     VALUES (:userId, :body, :goalId, :projectId, :skillId, :taskId, :reviewId)`,
    { userId, body, ...params(attachment) },
  );
  return result.insertId;
};

export const update = async (userId, id, patch) => {
  const sets = [];
  const values = { id, userId };

  if (patch.body !== undefined) {
    sets.push("body = :body");
    values.body = patch.body;
  }
  if ("attachment" in patch) {
    sets.push(
      "goal_id = :goalId",
      "project_id = :projectId",
      "skill_id = :skillId",
      "task_id = :taskId",
      "review_id = :reviewId",
    );
    Object.assign(values, params(patch.attachment));
  }

  if (!sets.length) return;
  await pool.query(
    `UPDATE notes SET ${sets.join(", ")} WHERE id = :id AND user_id = :userId`,
    values,
  );
};

export const remove = async (userId, id) => {
  const [result] = await pool.query(
    "DELETE FROM notes WHERE id = :id AND user_id = :userId",
    { id, userId },
  );
  return result.affectedRows;
};

export const targetOwned = async (userId, type, id) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM ${TABLE[type]} WHERE id = :id AND user_id = :userId`,
    {
      id,
      userId,
    },
  );
  return rows.length > 0;
};
