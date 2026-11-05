import type { AssessmentPolicy } from "@/shared/academic/grading";
import type { TutorCourseSummary } from "@/modules/tutor/shared/types";

export interface CourseModuleSummary {
  id: string;
  title: string;
  lessonCount: number;
}

export interface TutorCourseDetails extends TutorCourseSummary {
  assessmentPolicy?: AssessmentPolicy;
  coverPath?: string;
  coverUrl?: string;
  instructorId?: string;
  instructorName?: string;
  description: string;
  creditUnits: number;
  modules: CourseModuleSummary[];
}
