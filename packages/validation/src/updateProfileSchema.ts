import { z } from "zod";
import { strongPassword } from "./passwordSchema";

// Used on /complete-profile page (react-hook-form)
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: strongPassword,
});

// For profile page "Complete Profile" section
export const completeProfileSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// For profile page "Edit Profile" (name only)
export const updateNameSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type UpdateNameInput = z.infer<typeof updateNameSchema>;