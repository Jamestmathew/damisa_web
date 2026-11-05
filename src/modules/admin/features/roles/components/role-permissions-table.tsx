import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { RolePermissionGroup } from "../types";

const ROLE_LABEL: Record<RolePermissionGroup["role"], string> = {
  student: "Student",
  tutor: "Tutor",
  admin: "Admin",
  super_admin: "Super Admin",
};

const PERMISSION_LABEL: Record<string, string> = {
  "users:create": "Create users",
  "users:edit": "Edit users",
  "users:activate": "Activate accounts",
  "users:deactivate": "Deactivate accounts",
  "users:archive": "Archive accounts",
  "users:reset_password": "Reset passwords",
  "users:view_all": "View all users",
  "students:view_profile": "View student profiles",
  "students:edit_profile": "Edit student profiles",
  "academic_records:manage": "Manage academic records",
  "courses:manage_own": "Manage own courses",
  "assignments:manage_own": "Manage own assignments",
  "quizzes:manage_own": "Manage own quizzes",
  "exams:manage_own": "Manage own exams",
  "gradebook:manage_own": "Manage own gradebook",
  "attendance:manage_own": "Manage course attendance",
  "attendance:students": "Manage student daily attendance",
  "attendance:staff": "Manage Tutor and Admin attendance",
  "attendance:policy": "Configure attendance policies",
  "attendance:approve_student_tutor": "Approve Student and Tutor attendance",
  "attendance:approve_admin": "Approve Admin attendance",
  "attendance:clock_self": "Clock own arrival and departure",
  "attendance:view_self": "View own daily attendance",
  "payments:view_own": "View own payments",
  "payments:view_all": "View all payments",
  "payments:record": "Record payments",
  "payments:verify": "Verify payments",
  "payments:filter": "Filter payments",
  "ai:chat": "Use AI Chat",
  "ai:manage_knowledge_base": "Manage AI knowledge base",
  "ai:manage_governance": "Manage AI governance",
  "admins:create": "Create admin accounts",
  "admins:edit": "Edit admin accounts",
  "admins:activate": "Activate admin accounts",
  "admins:deactivate": "Deactivate admin accounts",
  "admins:archive": "Archive admin accounts",
  "offices:view_all": "View all offices",
  "ai:manage_policies": "Manage platform-wide AI policies",
};

export function RolePermissionsTable({
  groups,
}: {
  groups: RolePermissionGroup[];
}) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.role}>
          <CardHeader>
            <CardTitle className="text-base">
              {ROLE_LABEL[group.role]}
            </CardTitle>
            <CardDescription>
              {group.permissions.length} permission
              {group.permissions.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {group.permissions.map((permission) => (
              <Badge key={permission} variant="secondary">
                {PERMISSION_LABEL[permission] ?? permission}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
