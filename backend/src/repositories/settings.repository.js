import { pool } from "../config/db.js";

const COLUMNS = {
  theme: "theme",
  language: "language",
  notificationsEnabled: "notifications_enabled",
  dailyTaskLimit: "daily_task_limit",
  workStart: "work_start",
  workEnd: "work_end",
  sleepTime: "sleep_time",
  reviewDay: "review_day",
};

const toSettings = (r) => ({
  theme: r.theme,
  language: r.language,
  notificationsEnabled: Boolean(r.notifications_enabled),
  dailyTaskLimit: r.daily_task_limit,
  workStart: r.work_start.slice(0, 5),
  workEnd: r.work_end.slice(0, 5),
  sleepTime: r.sleep_time.slice(0, 5),
  reviewDay: r.review_day,
});

export const get = async (userId) => {
  await pool.query(
    "INSERT IGNORE INTO user_settings (user_id) VALUES (:userId)",
    { userId },
  );
  const [rows] = await pool.query(
    "SELECT * FROM user_settings WHERE user_id = :userId",
    { userId },
  );
  return toSettings(rows[0]);
};

export const update = async (userId, patch) => {
  const keys = Object.keys(patch).filter((k) => k in COLUMNS);
  if (!keys.length) return;
  const set = keys.map((k) => `${COLUMNS[k]} = :${k}`).join(", ");
  await pool.query(`UPDATE user_settings SET ${set} WHERE user_id = :userId`, {
    ...patch,
    userId,
  });
};
