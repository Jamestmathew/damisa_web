import TutorAttendanceReview from "@/modules/admin/features/teachers/components/staff-attendance-review";
import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  getTeachers,
  TeachersManager,
} from "@/modules/admin/features/teachers";

export const metadata: Metadata = { title: "Staff" };

export default async function AdminTeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const teachers = await getTeachers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description="Oversee every teaching staff account"
      />
      <TeachersManager teachers={teachers} />
      <TutorAttendanceReview searchParams={searchParams} />
    </div>
  );
}
