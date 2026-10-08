import { z } from "zod";

const text = z.string().trim().max(5000, "Answer is too long");
const count = z.number().int().min(0);
const percent = z.number().int().min(0).max(100);

export const saveReviewSchema = z.object({
  answers: z.object({
    wentWell: text.optional(),
    wentBad: text.optional(),
    wasted: text.optional(),
    learned: text.optional(),
    change: text.optional(),
  }),
  priorities: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Priority cannot be empty")
        .max(250, "Priority is too long"),
    )
    .max(5, "Choose at most 5 priorities"),
  stats: z.object({
    score: percent,
    focus: count,
    learning: count,
    tasksDone: count,
    tasksTotal: count,
    habits: percent,
    workouts: count,
  }),
});
