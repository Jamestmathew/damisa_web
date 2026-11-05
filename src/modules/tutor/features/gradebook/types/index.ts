export interface GradebookRow {
  id: string;
  studentName: string;
  courseCode: string;
  assignmentAvg: number | null;
  quizAvg: number | null;
  examScore: number | null;
  caPercent?: number | null;
  provisional?: boolean;
  hasMarks?: boolean;
  hasOverride?: boolean;
  overallPercent: number;
  letterGrade: string;
}
