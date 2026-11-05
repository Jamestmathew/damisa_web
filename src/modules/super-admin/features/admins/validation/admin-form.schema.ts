import { z } from "zod";

export const adminFormSchema = z.object({
  id: z.string().optional(),

  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  email: z.string().trim().email("Enter a valid email address"),

  staffId: z.string().trim().min(2, "Staff ID is required"),

  officeName: z.string().trim().optional(),
});

export type AdminFormSchema = z.infer<typeof adminFormSchema>;
