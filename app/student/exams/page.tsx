import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import { getExams, ExamList, ExamScheduleBanner } from "@/modules/student/features/exams";

export const metadata: Metadata = { title: "Exams" };

export default async function ExamsPage() {
  const exams = await getExams();
  const nextExam = exams.find((exam) => exam.status === "upcoming");

  return (
    <div className="space-y-6">
      <PageHeader title="Exams" description="Your scheduled and past examinations" />
      {nextExam ? <ExamScheduleBanner exam={nextExam} /> : null}
      <ExamList exams={exams} />
    </div>
  );
}
