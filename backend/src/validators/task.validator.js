import { z } from "zod";

const PRIORITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["todo", "in_progress", "completed", "skipped"];

const fields = {
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(250, "Title is too long"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .nullable(),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES),
  due: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Due date must be a valid date")
    .nullable()
    .transform((v) => v || null),
  est: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(1440),
  today: z.boolean(),
  projectId: z.number().int().positive().nullable(),
};

export const createTaskSchema = z.object({
  title: fields.title,
  description: fields.description.optional(),
  priority: fields.priority.optional(),
  due: fields.due.optional(),
  est: fields.est.optional(),
  projectId: fields.projectId.optional(),
  today: fields.today.optional(),
});

export const updateTaskSchema = z
  .object(fields)
  .partial()
  .refine((o) => Object.keys(o).length > 0, "Nothing to update");
