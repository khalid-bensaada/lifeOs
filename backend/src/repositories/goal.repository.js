import { pool } from "../config/db.js";

const COLUMNS = {
  title: "title",
  description: "description",
  category: "category",
  priority: "priority",
  status: "status",
  deadline: "deadline",
};

const toMilestone = (m) => ({
  id: m.id,
  title: m.title,
  done: Boolean(m.is_done),
});

const toGoal = (g, milestones) => ({
  id: g.id,
  title: g.title,
  description: g.description,
  category: g.category,
  priority: g.priority,
  status: g.status,
  deadline: g.deadline,
  milestones,
});

export const listByUser = async (userId) => {
  const [goals] = await pool.query(
    "SELECT * FROM goals WHERE user_id = :userId ORDER BY created_at DESC, id DESC",
    { userId },
  );
  if (!goals.length) return [];

  const [rows] = await pool.query(
    `SELECT m.* FROM milestones m
     JOIN goals g ON g.id = m.goal_id
     WHERE g.user_id = :userId
     ORDER BY m.position, m.id`,
    { userId },
  );

  const byGoal = new Map();
  for (const m of rows) {
    if (!byGoal.has(m.goal_id)) byGoal.set(m.goal_id, []);
    byGoal.get(m.goal_id).push(toMilestone(m));
  }
  return goals.map((g) => toGoal(g, byGoal.get(g.id) || []));
};

export const findById = async (userId, id) => {
  const [rows] = await pool.query(
    "SELECT * FROM goals WHERE id = :id AND user_id = :userId",
    { id, userId },
  );
  if (!rows[0]) return null;
  const [ms] = await pool.query(
    "SELECT * FROM milestones WHERE goal_id = :id ORDER BY position, id",
    { id },
  );
  return toGoal(rows[0], ms.map(toMilestone));
};

export const create = async (userId, d) => {
  const [result] = await pool.query(
    `INSERT INTO goals (user_id, title, description, category, priority, deadline)
     VALUES (:userId, :title, :description, :category, :priority, :deadline)`,
    {
      userId,
      title: d.title,
      description: d.description ?? null,
      category: d.category ?? "Other",
      priority: d.priority ?? "medium",
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
    `UPDATE goals SET ${set} WHERE id = :id AND user_id = :userId`,
    { ...patch, id, userId },
  );
};

export const remove = async (userId, id) => {
  const [result] = await pool.query(
    "DELETE FROM goals WHERE id = :id AND user_id = :userId",
    { id, userId },
  );
  return result.affectedRows;
};

export const addMilestone = async (goalId, title) => {
  await pool.query(
    `INSERT INTO milestones (goal_id, title, position)
     SELECT :goalId, :title, COALESCE(MAX(position) + 1, 0) FROM milestones WHERE goal_id = :goalId`,
    { goalId, title },
  );
};

export const updateMilestone = async (goalId, id, patch) => {
  const sets = [];
  const params = { id, goalId };
  if (patch.title !== undefined) {
    sets.push("title = :title");
    params.title = patch.title;
  }
  if (patch.done !== undefined) {
    sets.push("is_done = :done");
    params.done = patch.done;
  }
  if (!sets.length) return;
  await pool.query(
    `UPDATE milestones SET ${sets.join(", ")} WHERE id = :id AND goal_id = :goalId`,
    params,
  );
};

export const removeMilestone = async (goalId, id) => {
  await pool.query(
    "DELETE FROM milestones WHERE id = :id AND goal_id = :goalId",
    { id, goalId },
  );
};
