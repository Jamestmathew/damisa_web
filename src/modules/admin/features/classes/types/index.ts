export interface AdminClass {
  id: string;
  name: string;
  department: string;
  teacher: string;
  studentCount: number;
  schedule: string;
  studentIds?: string[];
  courseIds?: string[];
}

export type ClassActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };
