import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getStudents, StudentsManager } from "@/modules/admin/features/students";

export const metadata: Metadata = { title: "Students" };

export default async function AdminStudentsPage() {
  const students = await getStudents();

  return (
    <div>
      <PageHeader title="Student Management" description="Oversee every enrolled student" />
      <StudentsManager students={students} />
    </div>
  );
}
