import { ApiError } from "./ApiError.js";

export const parseId = (value) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new ApiError(400, "Invalid id");
  return n;
};

export const parseDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new ApiError(400, "Invalid date");
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, "Invalid date");
  }
  return value;
};

export const parseLevel = (value) => {
  const n = parseId(value);
  if (n > 4) throw new ApiError(400, "Invalid level");
  return n;
};

export const parseWeekStart = (value) => {
  parseDate(value);
  if (new Date(`${value}T00:00:00Z`).getUTCDay() !== 1) {
    throw new ApiError(400, "Week must start on a Monday");
  }
  return value;
};
