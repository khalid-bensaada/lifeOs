import { pool } from "../config/db.js";

const COLUMNS = {
  title: "title",
  date: "event_date",
  start: "start_time",
  end: "end_time",
};

const toEvent = (r) => ({
  id: r.id,
  title: r.title,
  date: r.event_date,
  start: r.start_time ? r.start_time.slice(0, 5) : "",
  end: r.end_time ? r.end_time.slice(0, 5) : "",
});

export const listByUser = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM calendar_events WHERE user_id = :userId ORDER BY event_date, start_time, id",
    { userId },
  );
  return rows.map(toEvent);
};

export const findById = async (userId, id) => {
  const [rows] = await pool.query(
    "SELECT * FROM calendar_events WHERE id = :id AND user_id = :userId",
    {
      id,
      userId,
    },
  );
  return rows[0] ? toEvent(rows[0]) : null;
};

export const create = async (userId, d) => {
  const [result] = await pool.query(
    `INSERT INTO calendar_events (user_id, title, event_date, start_time, end_time)
     VALUES (:userId, :title, :date, :start, :end)`,
    {
      userId,
      title: d.title,
      date: d.date,
      start: d.start || null,
      end: d.end || null,
    },
  );
  return result.insertId;
};

export const update = async (userId, id, patch) => {
  const keys = Object.keys(patch).filter((k) => k in COLUMNS);
  if (!keys.length) return;
  const set = keys.map((k) => `${COLUMNS[k]} = :${k}`).join(", ");
  await pool.query(
    `UPDATE calendar_events SET ${set} WHERE id = :id AND user_id = :userId`,
    {
      ...patch,
      id,
      userId,
    },
  );
};

export const remove = async (userId, id) => {
  const [result] = await pool.query(
    "DELETE FROM calendar_events WHERE id = :id AND user_id = :userId",
    {
      id,
      userId,
    },
  );
  return result.affectedRows;
};
