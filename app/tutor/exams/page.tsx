import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getTutorExams, ScheduleExamForm, TutorExamsList } from "@/modules/tutor/features/exams";
import { getTutorCourses } from "@/modules/tutor/features/courses/services/courses.service";

export const metadata: Metadata = { title: "Exams" };

export default async function TutorExamsPage() {
  const [exams, courses] = await Promise.all([getTutorExams(), getTutorCourses()]);
  const courseOptions = courses.map((c) => ({ id: c.id, label: `${c.code} · ${c.title}` }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <PageHeader title="Exams" description="Scheduled exams for your courses" />
        <TutorExamsList exams={exams} />
      </div>
      <div>
        <PageHeader title="Schedule an exam" />
        <ScheduleExamForm courseOptions={courseOptions} />
      </div>
    </div>
  );
}
