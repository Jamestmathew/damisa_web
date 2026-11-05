import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getTutorStudents, TutorStudentsTable } from "@/modules/tutor/features/students";

export const metadata: Metadata = { title: "Students" };

export default async function TutorStudentsPage() {
  const students = await getTutorStudents();

  return (
    <div>
      <PageHeader title="Students" description="Students enrolled in your courses" />
      <TutorStudentsTable students={students} />
    </div>
  );
}
