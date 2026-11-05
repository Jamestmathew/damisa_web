import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getTeachers, TeachersManager } from "@/modules/admin/features/teachers";

export const metadata: Metadata = { title: "Teachers" };

export default async function AdminTeachersPage() {
  const teachers = await getTeachers();

  return (
    <div>
      <PageHeader title="Teacher Management" description="Oversee every teaching staff account" />
      <TeachersManager teachers={teachers} />
    </div>
  );
}
