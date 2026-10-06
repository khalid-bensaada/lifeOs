import { z } from "zod";

export const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(150, "Name is too long"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category is too long")
    .optional(),
});

export const logSchema = z.object({
  done: z.boolean(),
});
