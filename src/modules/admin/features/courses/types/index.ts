export type CoursePublishStatus = "published" | "draft" | "archived";

export interface AdminCourse {
  coverPath?: string;
  coverUrl?: string;
  id: string;
  title: string;
  code: string;
  department: string;
  instructor: string;
  enrolledCount: number;
  status: CoursePublishStatus;
}
