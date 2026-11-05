import { GraduationCap } from "lucide-react";

import { EmptyState } from "@/modules/student/shared/components";
import type { ExamSummary } from "../types";

import { ExamCard } from "./exam-card";

export function ExamList({ exams }: { exams: ExamSummary[] }) {
  if (exams.length === 0) {
    return <EmptyState icon={GraduationCap} title="No exams scheduled" />;
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <ExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  );
}
