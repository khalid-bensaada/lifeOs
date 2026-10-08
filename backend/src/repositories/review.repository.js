import { pool } from "../config/db.js";

const toReview = (r, priorities) => ({
  id: r.id,
  weekStart: r.week_start,
  savedAt: String(r.updated_at).slice(0, 10),
  stats: typeof r.stats === "string" ? JSON.parse(r.stats) : r.stats,
  answers: {
    wentWell: r.went_well || "",
    wentBad: r.went_bad || "",
    wasted: r.wasted || "",
    learned: r.learned || "",
    change: r.change_next || "",
  },
  priorities,
});

export const listByUser = async (userId) => {
  const [reviews] = await pool.query(
    "SELECT * FROM weekly_reviews WHERE user_id = :userId ORDER BY week_start DESC",
    { userId },
  );
  if (!reviews.length) return [];

  const [rows] = await pool.query(
    `SELECT p.review_id, p.title
     FROM weekly_priorities p
     JOIN weekly_reviews r ON r.id = p.review_id
     WHERE r.user_id = :userId
     ORDER BY p.position, p.id`,
    { userId },
  );

  const byReview = new Map();
  for (const p of rows) {
    if (!byReview.has(p.review_id)) byReview.set(p.review_id, []);
    byReview.get(p.review_id).push(p.title);
  }
  return reviews.map((r) => toReview(r, byReview.get(r.id) || []));
};

export const findByWeek = async (userId, weekStart) => {
  const [rows] = await pool.query(
    "SELECT * FROM weekly_reviews WHERE user_id = :userId AND week_start = :weekStart",
    { userId, weekStart },
  );
  if (!rows[0]) return null;
  const [ps] = await pool.query(
    "SELECT title FROM weekly_priorities WHERE review_id = :id ORDER BY position, id",
    { id: rows[0].id },
  );
  return toReview(
    rows[0],
    ps.map((p) => p.title),
  );
};

export const save = async (userId, weekStart, d) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO weekly_reviews
         (user_id, week_start, went_well, went_bad, wasted, learned, change_next, stats)
       VALUES
         (:userId, :weekStart, :wentWell, :wentBad, :wasted, :learned, :change, :stats)
       ON DUPLICATE KEY UPDATE
         went_well = :wentWell, went_bad = :wentBad, wasted = :wasted,
         learned = :learned, change_next = :change, stats = :stats`,
      {
        userId,
        weekStart,
        wentWell: d.answers.wentWell ?? "",
        wentBad: d.answers.wentBad ?? "",
        wasted: d.answers.wasted ?? "",
        learned: d.answers.learned ?? "",
        change: d.answers.change ?? "",
        stats: JSON.stringify(d.stats),
      },
    );

    const [rows] = await conn.query(
      "SELECT id FROM weekly_reviews WHERE user_id = :userId AND week_start = :weekStart",
      { userId, weekStart },
    );
    const id = rows[0].id;

    await conn.query("DELETE FROM weekly_priorities WHERE review_id = :id", {
      id,
    });
    for (const [position, title] of d.priorities.entries()) {
      await conn.query(
        "INSERT INTO weekly_priorities (review_id, title, position) VALUES (:id, :title, :position)",
        { id, title, position },
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
