import { z } from "zod";

const CATEGORIES = [
  "Programming",
  "Design",
  "Video Editing",
  "3D",
  "Languages",
  "Business",
  "Other",
];

export const createSkillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  category: z.enum(CATEGORIES).optional(),
});

export const titleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
});

export const doneSchema = z.object({
  done: z.boolean(),
});
