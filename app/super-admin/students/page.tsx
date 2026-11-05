import type { Metadata } from "next";
import { PageHeader } from "@/shared/components";
import { getPlatformStudents } from "@/modules/super-admin/features/students/services/students.service";
import { PlatformStudentsTable } from "@/modules/super-admin/features/students/components/platform-students-table";
export const metadata: Metadata = { title: "Students across organizations" };
export default async function PlatformStudentsPage() {
  const students = await getPlatformStudents();
  return (
    <div>
      <PageHeader
        title="Students"
        description="Students across all companies and offices, including classes, fees, payment balances, and activity."
      />
      <PlatformStudentsTable students={students} />
    </div>
  );
}
