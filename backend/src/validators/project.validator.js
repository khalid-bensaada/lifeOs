import { z } from "zod";

const STATUSES = [
  "idea",
  "planning",
  "in_progress",
  "paused",
  "completed",
  "archived",
];

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
  status: z.enum(STATUSES),
  tech: z.string().trim().max(200, "Technology is too long"),
  goalId: z.number().int().positive().nullable(),
  deadline: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Deadline must be a valid date")
    .nullable()
    .transform((v) => v || null),
};

export const createProjectSchema = z.object({
  title: fields.title,
  description: fields.description.optional(),
  status: fields.status.optional(),
  tech: fields.tech.optional(),
  goalId: fields.goalId.optional(),
  deadline: fields.deadline.optional(),
});

export const updateProjectSchema = z
  .object(fields)
  .partial()
  .refine((o) => Object.keys(o).length > 0, "Nothing to update");
