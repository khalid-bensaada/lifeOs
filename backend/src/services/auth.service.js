import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import * as users from "../repositories/user.repository.js";

const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwt.secret, {
    expiresIn: env.jwt.expiresInSec,
  });

export const verifyToken = (token) => jwt.verify(token, env.jwt.secret);

export const register = async ({ name, email, password }) => {
  if (await users.findByEmail(email)) {
    throw new ApiError(409, "This email is already registered");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await users.create({ name, email, passwordHash });
    return { user, token: signToken(user.id) };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      throw new ApiError(409, "This email is already registered");
    throw err;
  }
};

export const login = async ({ email, password }) => {
  const row = await users.findByEmail(email);
  const ok = row && (await bcrypt.compare(password, row.password_hash));
  if (!ok) throw new ApiError(401, "Invalid email or password");
  return {
    user: { id: row.id, name: row.name, email: row.email },
    token: signToken(row.id),
  };
};

export const getUser = (id) => users.findById(id);
