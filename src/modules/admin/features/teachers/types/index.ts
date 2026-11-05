import type { UserStatus } from "@/modules/admin/shared/types";

export interface AdminTeacher {
  id: string;
  name: string;
  email: string;
  department: string;
  coursesAssigned: number;
  status: UserStatus;
  joinedAt: string;
}
