import type { AssessmentPolicy } from "@/shared/academic/grading";
import type { CourseSummary } from "@/modules/student/shared/types";

export interface CourseModule {
  id: string;
  title: string;
  lessonCount: number;
  completedLessonCount: number;
}

export interface CourseDetails extends CourseSummary {
  assessmentPolicy?: AssessmentPolicy;
  description: string;
  instructorTitle: string;
  modules: CourseModule[];
}
