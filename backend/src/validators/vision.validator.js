import { z } from "zod";

const text = z.string().trim().max(3000, "Text is too long");

export const saveVisionSchema = z.object({
  oneYear: text,
  threeYear: text,
  skills: text,
  projects: text,
  habits: text,
});
