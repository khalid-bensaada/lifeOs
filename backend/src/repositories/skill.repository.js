import { pool } from "../config/db.js";

const LEVELS = [1, 2, 3, 4];

const toItem = (r) => ({ id: r.id, title: r.title, done: Boolean(r.is_done) });

const toSkill = (s, milestones, practice) => ({
  id: s.id,
  name: s.name,
  category: s.category,
  levels: LEVELS.map((level) => ({
    milestones: milestones.filter((m) => m.level === level).map(toItem),
  })),
  projects: practice.map(toItem),
});

const groupBy = (rows) => {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.skill_id)) map.set(r.skill_id, []);
    map.get(r.skill_id).push(r);
  }
  return map;
};

export const listByUser = async (userId) => {
  const [skills] = await pool.query(
    "SELECT * FROM skills WHERE user_id = :userId ORDER BY created_at DESC, id DESC",
    { userId },
  );
  if (!skills.length) return [];

  const [ms] = await pool.query(
    `SELECT m.* FROM skill_milestones m
     JOIN skills s ON s.id = m.skill_id
     WHERE s.user_id = :userId
     ORDER BY m.position, m.id`,
    { userId },
  );
  const [ps] = await pool.query(
    `SELECT p.* FROM skill_projects p
     JOIN skills s ON s.id = p.skill_id
     WHERE s.user_id = :userId
     ORDER BY p.position, p.id`,
    { userId },
  );

  const msBy = groupBy(ms);
  const psBy = groupBy(ps);
  return skills.map((s) =>
    toSkill(s, msBy.get(s.id) || [], psBy.get(s.id) || []),
  );
};

export const findById = async (userId, id) => {
  const [rows] = await pool.query(
    "SELECT * FROM skills WHERE id = :id AND user_id = :userId",
    { id, userId },
  );
  if (!rows[0]) return null;
  const [ms] = await pool.query(
    "SELECT * FROM skill_milestones WHERE skill_id = :id ORDER BY position, id",
    { id },
  );
  const [ps] = await pool.query(
    "SELECT * FROM skill_projects WHERE skill_id = :id ORDER BY position, id",
    { id },
  );
  return toSkill(rows[0], ms, ps);
};

export const create = async (userId, { name, category }) => {
  const [result] = await pool.query(
    "INSERT INTO skills (user_id, name, category) VALUES (:userId, :name, :category)",
    { userId, name, category: category ?? "Other" },
  );
  return result.insertId;
};

export const remove = async (userId, id) => {
  const [result] = await pool.query(
    "DELETE FROM skills WHERE id = :id AND user_id = :userId",
    { id, userId },
  );
  return result.affectedRows;
};

export const addMilestone = async (skillId, level, title) => {
  await pool.query(
    `INSERT INTO skill_milestones (skill_id, level, title, position)
     SELECT :skillId, :level, :title, COALESCE(MAX(position) + 1, 0)
     FROM skill_milestones WHERE skill_id = :skillId AND level = :level`,
    { skillId, level, title },
  );
};

export const setMilestone = async (skillId, id, done) => {
  await pool.query(
    "UPDATE skill_milestones SET is_done = :done WHERE id = :id AND skill_id = :skillId",
    {
      done,
      id,
      skillId,
    },
  );
};

export const addPractice = async (skillId, title) => {
  await pool.query(
    `INSERT INTO skill_projects (skill_id, title, position)
     SELECT :skillId, :title, COALESCE(MAX(position) + 1, 0)
     FROM skill_projects WHERE skill_id = :skillId`,
    { skillId, title },
  );
};

export const setPractice = async (skillId, id, done) => {
  await pool.query(
    "UPDATE skill_projects SET is_done = :done WHERE id = :id AND skill_id = :skillId",
    {
      done,
      id,
      skillId,
    },
  );
};
