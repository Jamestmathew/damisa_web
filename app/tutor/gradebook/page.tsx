import type { Metadata } from "next";
import { PageHeader } from "@/shared/components";
import {
  getGradebookRows,
  GradebookTable,
} from "@/modules/tutor/features/gradebook";
import { getTutorCourses } from "@/modules/tutor/features/courses/services/courses.service";
import { getTutorExams } from "@/modules/tutor/features/exams/services/exams.service";
import { listRecords } from "@/shared/data/records";
import type { AssessmentMark } from "@/shared/academic/grading";
import { AssessmentEntryForm } from "@/modules/tutor/features/gradebook/components/assessment-entry-form";
export const metadata: Metadata = { title: "Gradebook" };
export default async function GradebookPage() {
  const [rows, courses, exams, marks] = await Promise.all([
    getGradebookRows(),
    getTutorCourses(),
    getTutorExams(),
    listRecords<AssessmentMark>("assessment_grade"),
  ]);
  const students = rows.map((row) => {
    const [id, courseId] = row.id.split(":");
    return { id: id!, courseId: courseId!, name: row.studentName };
  });
  return (
    <div>
      <PageHeader
        title="Gradebook"
        description="Grade assignments, CAs, and exams. Default final score: CA 30% and Exam 70%. Totals remain provisional until both portions are recorded."
      />
      <AssessmentEntryForm
        courses={courses}
        students={students}
        exams={exams}
        marks={marks}
      />
      <GradebookTable rows={rows} />
    </div>
  );
}
