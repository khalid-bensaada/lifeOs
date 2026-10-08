import { pool } from "../config/db.js";

const toReview = (r) => ({
  date: r.review_date,
  wentWell: r.went_well || "",
  improve: r.improve || "",
  tomorrowFirst: r.tomorrow_first || "",
});

export const listRecent = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM daily_reviews
     WHERE user_id = :userId AND review_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     ORDER BY review_date DESC`,
    { userId },
  );
  return rows.map(toReview);
};

export const findByDate = async (userId, date) => {
  const [rows] = await pool.query(
    "SELECT * FROM daily_reviews WHERE user_id = :userId AND review_date = :date",
    { userId, date },
  );
  return rows[0] ? toReview(rows[0]) : null;
};

export const save = async (userId, date, d) => {
  await pool.query(
    `INSERT INTO daily_reviews (user_id, review_date, went_well, improve, tomorrow_first)
     VALUES (:userId, :date, :wentWell, :improve, :tomorrowFirst)
     ON DUPLICATE KEY UPDATE
       went_well = :wentWell, improve = :improve, tomorrow_first = :tomorrowFirst`,
    {
      userId,
      date,
      wentWell: d.wentWell ?? "",
      improve: d.improve ?? "",
      tomorrowFirst: d.tomorrowFirst ?? "",
    },
  );
};
