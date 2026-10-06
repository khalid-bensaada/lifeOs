import { z } from "zod";
import { isoDate, isoTime } from "./common.js";

export const createEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title is too long"),
    date: isoDate,
    start: isoTime.nullable().optional(),
    end: isoTime.nullable().optional(),
  })
  .refine(
    (o) => !o.start || !o.end || o.end > o.start,
    "End time must be after start time",
  );
