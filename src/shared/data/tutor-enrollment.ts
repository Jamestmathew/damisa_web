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
  if (enrollment.type === "tutor_assignment") return [];
  if (enrollment.type === "course_enrollment")
    return (enrollment.courseIds ?? []).filter((id) =>
      courses.some(
        (course) =>
          course.id === id && course.instructorId === enrollment.tutorId,
      ),
    );
  return enrollment.courseIds ?? [];
}
