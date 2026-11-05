export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  courseCount: number;
  teacherCount: number;
}

export type DepartmentActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };
