export interface AssessmentPolicy {
  caWeight: number;
  examWeight: number;
}
export const DEFAULT_ASSESSMENT_POLICY: AssessmentPolicy = {
  caWeight: 30,
  examWeight: 70,
};
export interface AssessmentMark {
  id: string;
  studentId: string;
  courseId: string;
  title: string;
  category: "ca" | "exam";
  score: number;
  maxScore: number;
  source: "assignment" | "quiz" | "manual";
  assessmentId?: string;
}
export function calculateResult(
  marks: AssessmentMark[],
  policy: AssessmentPolicy = DEFAULT_ASSESSMENT_POLICY,
) {
  const manualCa = marks.filter(
    (m) => m.category === "ca" && m.source === "manual",
  );
  const ca = manualCa.length
    ? manualCa
    : marks.filter((m) => m.category === "ca");
  const exams = marks.filter((m) => m.category === "exam");
  const percent = (rows: AssessmentMark[]) => {
    const maximum = rows.reduce((n, m) => n + m.maxScore, 0);
    return maximum
      ? (rows.reduce((n, m) => n + m.score, 0) / maximum) * 100
      : null;
  };
  const caPercent = percent(ca),
    examPercent = percent(exams);
  const caReady = caPercent !== null && policy.caWeight > 0,
    examReady = examPercent !== null && policy.examWeight > 0;
  const complete =
    (policy.caWeight === 0 || caReady) &&
    (policy.examWeight === 0 || examReady);
  const value = complete
    ? ((caPercent ?? 0) * policy.caWeight) / 100 +
      ((examPercent ?? 0) * policy.examWeight) / 100
    : caReady
      ? caPercent
      : examReady
        ? examPercent
        : null;
  const round = (n: number | null) =>
    n === null ? null : Math.round(n * 100) / 100;
  return {
    caPercent: round(caPercent),
    examPercent: round(examPercent),
    overallPercent: round(value),
    provisional: !complete,
    caMarkIds: ca.map((m) => m.id),
  };
}
export function letterFor(percent: number) {
  return percent >= 70
    ? "A"
    : percent >= 60
      ? "B"
      : percent >= 50
        ? "C"
        : percent >= 45
          ? "D"
          : percent >= 40
            ? "E"
            : "F";
}
