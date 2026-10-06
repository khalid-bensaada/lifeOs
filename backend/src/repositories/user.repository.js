import { pool } from "../config/db.js";

export const findByEmail = async (email) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = :email",
    { email },
  );
  return rows[0] || null;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, name, email FROM users WHERE id = :id",
    { id },
  );
  return rows[0] || null;
};

export const create = async ({ name, email, passwordHash }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      "INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :passwordHash)",
      { name, email, passwordHash },
    );
    await conn.query("INSERT INTO user_settings (user_id) VALUES (:id)", {
      id: result.insertId,
    });
    await conn.commit();
    return { id: result.insertId, name, email };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
