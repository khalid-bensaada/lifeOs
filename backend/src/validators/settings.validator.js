import { z } from "zod";
import { isoTime } from "./common.js";

export const updateSettingsSchema = z
  .object({
    theme: z.enum(["light", "dark", "system"]),
    language: z.enum(["en", "ar", "fr"]),
    notificationsEnabled: z.boolean(),
    dailyTaskLimit: z
      .number()
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(10, "Limit cannot be more than 10"),
    workStart: isoTime,
    workEnd: isoTime,
    sleepTime: isoTime,
    reviewDay: z.number().int().min(0).max(6),
  })
  .partial()
  .refine((o) => Object.keys(o).length > 0, "Nothing to update");
