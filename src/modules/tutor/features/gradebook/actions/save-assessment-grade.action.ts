"use server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { listRecords, getRecord, saveRecord } from "@/shared/data/records";
import { getOfficePeople } from "@/shared/data/people";
import type { AssessmentMark } from "@/shared/academic/grading";
const schema = z
  .object({
    id: z.string().optional(),
    courseId: z.string().uuid(),
    studentId: z.string().uuid(),
    category: z.enum(["ca", "exam"]),
    title: z.string().trim().max(200),
    assessmentId: z.string().optional(),
    score: z.coerce.number<number>().finite().min(0),
    maxScore: z.coerce.number<number>().finite().positive().max(1000),
  })
  .refine((v) => v.score <= v.maxScore, {
    message: "Score cannot exceed the maximum.",
    path: ["score"],
  });
export async function saveAssessmentGradeAction(data: FormData) {
  await authorizeAction(["tutor"]);
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success)
    return {
      ok: false as const,
      error:
        "Select a student and assessment, and enter a score within the maximum.",
    };
  const input = parsed.data;
  const course = await getRecord<{ title: string }>("course", input.courseId);
  const student = (await getOfficePeople()).find(
    (p) => p.id === input.studentId && p.role === "student",
  );
  const classes = await listRecords<{
    courseIds?: string[];
    studentIds?: string[];
  }>("class");
  if (
    !course ||
    !student ||
    !classes.some(
      (c) =>
        c.courseIds?.includes(input.courseId) &&
        c.studentIds?.includes(input.studentId),
    )
  )
    return {
      ok: false as const,
      error: "Select a student enrolled in one of your courses.",
    };
  let title = input.title,
    assessmentId = input.assessmentId ?? "";
  if (input.category === "exam") {
    const exam = await getRecord<{ courseId: string; title: string }>(
      "exam",
      assessmentId,
    );
    if (!exam || exam.courseId !== input.courseId)
      return {
        ok: false as const,
        error: "Choose a scheduled exam for this course.",
      };
    title = exam.title;
  } else {
    if (title.length < 2)
      return { ok: false as const, error: "Enter the CA name." };
    assessmentId = title.toLowerCase().trim();
  }
  const matching = (await listRecords<AssessmentMark>("assessment_grade")).find(
    (m) =>
      m.studentId === input.studentId &&
      m.courseId === input.courseId &&
      m.category === input.category &&
      m.assessmentId === assessmentId,
  );
  const existing = input.id
    ? await getRecord<AssessmentMark>("assessment_grade", input.id)
    : matching;
  if (
    input.id &&
    (!existing ||
      existing.courseId !== input.courseId ||
      existing.studentId !== input.studentId ||
      existing.category !== input.category)
  )
    return { ok: false as const, error: "Assessment record not found." };
  if (matching && existing && matching.id !== existing.id)
    return {
      ok: false as const,
      error: "This student already has a grade for that assessment.",
    };
  const hash = createHash("sha256")
    .update(
      `${input.courseId}:${input.studentId}:${input.category}:${assessmentId}`,
    )
    .digest("hex");
  const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  await saveRecord<AssessmentMark>(
    "assessment_grade",
    {
      ...existing,
      id: existing?.id ?? id,
      studentId: input.studentId,
      courseId: input.courseId,
      title,
      category: input.category,
      score: input.score,
      maxScore: input.maxScore,
      source: "manual",
      assessmentId,
    },
    existing?.id,
  );
  revalidatePath("/tutor/gradebook");
  revalidatePath("/student/grades");
  revalidatePath("/student/dashboard");
  return { ok: true as const };
}
