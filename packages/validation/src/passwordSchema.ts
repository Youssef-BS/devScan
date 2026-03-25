import { z } from "zod";

// Reusable strong password rule: min 8 chars, 1 uppercase, 1 symbol
export const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");
