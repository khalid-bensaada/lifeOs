import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(255);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});
