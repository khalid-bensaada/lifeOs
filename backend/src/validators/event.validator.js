import { z } from "zod";
import { isoDate, isoTime } from "./common.js";

const title = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title is too long");

const afterStart = (o) => !o.start || !o.end || o.end > o.start;

export const createEventSchema = z
  .object({
    title,
    date: isoDate,
    start: isoTime.nullable().optional(),
    end: isoTime.nullable().optional(),
  })
  .refine(afterStart, "End time must be after start time");

export const updateEventSchema = z
  .object({
    title: title.optional(),
    date: isoDate.optional(),
    start: isoTime.nullable().optional(),
    end: isoTime.nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, "Nothing to update")
  .refine(afterStart, "End time must be after start time");
