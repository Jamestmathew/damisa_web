export interface TutorEnrollment {
  id?: string;
  type?: string;
  tutorId?: string;
  tutorName?: string;
  studentIds?: string[];
  courseIds?: string[];
}
export function enrollmentCourseIds(
  enrollment: TutorEnrollment,
  courses: { id: string; instructorId?: string }[],
) {
  return enrollment.type === "tutor_assignment" && enrollment.tutorId
    ? courses
        .filter((course) => course.instructorId === enrollment.tutorId)
        .map((course) => course.id)
    : (enrollment.courseIds ?? []);
}
