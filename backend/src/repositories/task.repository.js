import { pool } from "../config/db.js";

const COLUMNS = {
  title: "title",
  description: "description",
  priority: "priority",
  status: "status",
  due: "due_date",
  est: "est_min",
  projectId: "project_id",
};

const SELECT = "*, (planned_date = CURDATE()) AS today_flag";

const toTask = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  priority: r.priority,
  status: r.status,
  due: r.due_date,
  est: r.est_min,
  today: Boolean(r.today_flag),
  projectId: r.project_id,
});

export const listByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ${SELECT} FROM tasks
     WHERE user_id = :userId AND archived_at IS NULL
     ORDER BY created_at DESC, id DESC`,
    { userId },
  );
  return rows.map(toTask);
};

export const findById = async (userId, id) => {
  const [rows] = await pool.query(
    `SELECT ${SELECT} FROM tasks WHERE id = :id AND user_id = :userId AND archived_at IS NULL`,
    { id, userId },
  );
  return rows[0] ? toTask(rows[0]) : null;
};

export const create = async (userId, d) => {
  const [result] = await pool.query(
    `INSERT INTO tasks (user_id, project_id, title, description, priority, due_date, est_min, planned_date)
     VALUES (:userId, :projectId, :title, :description, :priority, :due, :est, IF(:today, CURDATE(), NULL))`,
    {
      userId,
      projectId: d.projectId ?? null,
      title: d.title,
      description: d.description ?? null,
      priority: d.priority ?? "medium",
      due: d.due ?? null,
      est: d.est ?? 30,
      today: d.today ? 1 : 0,
    },
  );
  return result.insertId;
};

export const update = async (userId, id, patch) => {
  const sets = [];
  const params = { id, userId };

  for (const key of Object.keys(patch)) {
    if (key === "today") {
      sets.push(
        patch.today ? "planned_date = CURDATE()" : "planned_date = NULL",
      );
    } else if (key in COLUMNS) {
      sets.push(`${COLUMNS[key]} = :${key}`);
      params[key] = patch[key];
    }
  }

  if (!sets.length) return;
  await pool.query(
    `UPDATE tasks SET ${sets.join(", ")} WHERE id = :id AND user_id = :userId`,
    params,
  );
};

export const remove = async (userId, id) => {
  const [result] = await pool.query(
    "DELETE FROM tasks WHERE id = :id AND user_id = :userId",
    { id, userId },
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

export const dailyLimit = async (userId) => {
  const [rows] = await pool.query(
    "SELECT daily_task_limit FROM user_settings WHERE user_id = :userId",
    { userId },
  );
  return rows[0]?.daily_task_limit ?? 5;
};

export const countToday = async (userId) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS n FROM tasks WHERE user_id = :userId AND planned_date = CURDATE() AND archived_at IS NULL",
    { userId },
  );
  return Number(rows[0].n);
};
