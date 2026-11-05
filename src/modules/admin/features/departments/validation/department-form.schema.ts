import { z } from "zod";

export const departmentFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").max(10, "Code is too long"),
  headOfDepartment: z.string().min(2, "Head of department is required"),
});

export type DepartmentFormSchema = z.infer<typeof departmentFormSchema>;
