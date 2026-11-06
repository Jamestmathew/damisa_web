import { getContext } from "@/shared/security/context";
import { getOfficePeople } from "@/shared/data/people";
import { listRecords } from "@/shared/data/records";
import type { TutorEnrollment } from "@/shared/data/tutor-enrollment";
import { CourseStudentSelector } from "./student-selector";
export async function CourseStudents({ courseId }: { courseId: string }) {
  const { user } = await getContext();
  const links = await listRecords<TutorEnrollment>("class");
  const assigned = new Set(
    links
      .filter((e) => e.type === "tutor_assignment" && e.tutorId === user.id)
      .flatMap((e) => e.studentIds ?? []),
  );
  const students = (await getOfficePeople())
    .filter((p) => assigned.has(p.id) && p.status === "active")
    .map((p) => ({ id: p.id, name: p.name, matricNumber: p.matric_number }));
  const selected = links
    .filter(
      (e) =>
        e.type === "course_enrollment" &&
        e.tutorId === user.id &&
        e.courseIds?.includes(courseId),
    )
    .flatMap((e) => e.studentIds ?? []);
  return (
    <CourseStudentSelector
      courseId={courseId}
      students={students}
      initialSelected={selected}
    />
  );
}
