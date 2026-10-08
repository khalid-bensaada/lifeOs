import { z } from "zod";

const text = z.string().trim().max(5000, "Answer is too long");

export const saveDailySchema = z.object({
  wentWell: text.optional(),
  improve: text.optional(),
  tomorrowFirst: z.string().trim().max(250, "Priority is too long").optional(),
});
