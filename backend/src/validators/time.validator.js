import { z } from "zod";
import { isoDate } from "./common.js";

const CATEGORIES = [
  "Programming",
  "Design",
  "Video Editing",
  "3D",
  "French",
  "School",
  "Gym",
  "Personal",
  "Reading",
  "Entertainment",
  "Other",
];

export const createEntrySchema = z.object({
  category: z.enum(CATEGORIES),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  projectId: z.number().int().positive().nullable().optional(),
  taskId: z.number().int().positive().nullable().optional(),
  date: isoDate,
  seconds: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration is too short")
    .max(604800, "Duration is too long"),
  note: z.string().trim().max(2000, "Note is too long").optional(),
});
