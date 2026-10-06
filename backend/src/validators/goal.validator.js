import { z } from "zod";

const CATEGORIES = [
  "Career",
  "Programming",
  "Design",
  "3D",
  "Video",
  "Fitness",
  "Finance",
  "Personal",
  "Education",
  "Other",
];
const PRIORITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["active", "completed", "paused", "archived"];

const fields = {
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .nullable(),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES),
  deadline: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Deadline must be a valid date")
    .nullable()
    .transform((v) => v || null),
};

const notEmpty = (o) => Object.keys(o).length > 0;

export const createGoalSchema = z.object({
  title: fields.title,
  description: fields.description.optional(),
  category: fields.category.optional(),
  priority: fields.priority.optional(),
  deadline: fields.deadline.optional(),
});

export const updateGoalSchema = z
  .object(fields)
  .partial()
  .refine(notEmpty, "Nothing to update");

export const createMilestoneSchema = z.object({ title: fields.title });

export const updateMilestoneSchema = z
  .object({ title: fields.title.optional(), done: z.boolean().optional() })
  .refine(notEmpty, "Nothing to update");
