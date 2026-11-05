import "server-only";
import type { ReportSummary } from "../types";
export async function getReports(): Promise<ReportSummary[]> {
  return [
    {
      id: "academic",
      title: "Student Enrollment",
      description:
        "Student names, matric numbers, and account status in your office.",
      category: "academic",
      generatedAt: "Generated on download",
    },
    {
      id: "financial",
      title: "Company Income Records",
      description:
        "Manually entered company earnings, dates, amounts, and references.",
      category: "financial",
      generatedAt: "Generated on download",
    },
    {
      id: "attendance",
      title: "Attendance Records",
      description: "Recorded attendance by student, course, and date.",
      category: "attendance",
      generatedAt: "Generated on download",
    },
  ];
}
