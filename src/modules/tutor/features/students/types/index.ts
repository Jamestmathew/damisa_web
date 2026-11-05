export interface TutorStudent {
  id: string;
  name: string;
  email: string;
  matricNumber?: string;
  courseTitle: string;
  courseCode: string;
  progressPercent: number;
  averageGrade: number;
  attendancePercent: number;
}
