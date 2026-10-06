import * as service from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

const baseCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv === "production",
};

const send = (res, status, { user, token }) => {
  res.cookie("token", token, {
    ...baseCookie,
    maxAge: env.jwt.expiresInSec * 1000,
  });
  res.status(status).json({ success: true, data: { user } });
};

export const register = asyncHandler(async (req, res) => {
  send(res, 201, await service.register(req.body));
});

export const login = asyncHandler(async (req, res) => {
  send(res, 200, await service.login(req.body));
});

export const logout = (req, res) => {
  res.clearCookie("token", baseCookie);
  res.json({ success: true, data: null });
};

export const me = (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};
