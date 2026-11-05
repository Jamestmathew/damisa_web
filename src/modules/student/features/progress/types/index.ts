export interface CourseProgressItem {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  progressPercent: number;
  lessonsCompleted: number;
  lessonsTotal: number;
}

export interface SkillProgressItem {
  skill: string;
  progressPercent: number;
}

export interface ProgressOverview {
  overallPercent: number;
  courses: CourseProgressItem[];
  skills: SkillProgressItem[];
}
