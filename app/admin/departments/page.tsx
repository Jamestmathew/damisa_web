import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getDepartments, DepartmentsManager } from "@/modules/admin/features/departments";

export const metadata: Metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div>
      <PageHeader title="Department Management" description="Organize academic departments" />
      <DepartmentsManager departments={departments} />
    </div>
  );
}
