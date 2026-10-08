import { z } from "zod";

const attachment = z.object({
  type: z.enum(["goal", "project", "skill", "task", "review"]),
  id: z.number().int().positive(),
});

const body = z
  .string()
  .trim()
  .min(1, "Note cannot be empty")
  .max(5000, "Note is too long");

export const createNoteSchema = z.object({
  body,
  attachment: attachment.nullable().optional(),
});

export const updateNoteSchema = z
  .object({
    body: body.optional(),
    attachment: attachment.nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, "Nothing to update");
