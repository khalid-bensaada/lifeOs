import { z } from "zod";

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be valid")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Date must be valid");

export const isoTime = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be valid");
