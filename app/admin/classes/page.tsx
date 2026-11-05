import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getClasses, ClassesManager } from "@/modules/admin/features/classes";
import { getDepartments } from "@/modules/admin/features/departments";

import { getUsers } from "@/modules/admin/features/users/services/users.service";
import { listRecords } from "@/shared/data/records";

export const metadata: Metadata = { title: "Classes" };

export default async function ClassesPage() {
  const [classes, departments, users, courses] = await Promise.all([
    getClasses(),
    getDepartments(),
    getUsers(),
    listRecords<{ title: string; code: string }>("course"),
  ]);

  return (
    <div>
      <PageHeader
        title="Class Management"
        description="Manage class sections and schedules"
      />
      <ClassesManager
        students={users
          .filter((u) => u.role === "student" && u.status === "active")
          .map((u) => ({ id: u.id, name: `${u.name} (${u.matricNumber})` }))}
        courses={courses.map((c) => ({
          id: c.id,
          name: `${c.code}: ${c.title}`,
        }))}
        classes={classes}
        departmentNames={departments.map((d) => d.name)}
      />
    </div>
  );
}
