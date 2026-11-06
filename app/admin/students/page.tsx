import { AssignTutorForm } from "@/modules/admin/features/students/components/assign-tutor-form";
import { getOfficePeople } from "@/shared/data/people";
import { listRecords } from "@/shared/data/records";
import type { TutorEnrollment } from "@/shared/data/tutor-enrollment";
import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  getStudents,
  StudentsManager,
} from "@/modules/admin/features/students";

export const metadata: Metadata = { title: "Students" };

export default async function AdminStudentsPage() {
  const [students, people, enrollments] = await Promise.all([
    getStudents(),
    getOfficePeople(),
    listRecords<TutorEnrollment>("class"),
  ]);

  return (
    <div>
      <PageHeader
        title="Student Management"
        description="Oversee every enrolled student"
      />
      <AssignTutorForm
        students={people.filter((p) => p.role === "student")}
        tutors={people.filter(
          (p) => p.role === "tutor" && p.status === "active",
        )}
        assignments={enrollments
          .filter((e) => e.type === "tutor_assignment")
          .flatMap((e) =>
            (e.studentIds ?? []).map((studentId) => ({
              studentId,
              tutorId: e.tutorId ?? "",
              tutorName: e.tutorName ?? "",
            })),
          )}
      />
      <StudentsManager students={students} />
    </div>
  );
}
