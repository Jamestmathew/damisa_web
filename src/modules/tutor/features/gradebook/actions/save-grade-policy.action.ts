"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { getRecord, saveRecord } from "@/shared/data/records";
import type { TutorCourseDetails } from "@/modules/tutor/features/courses/types";
export async function saveGradePolicyAction(data: FormData) {
  await authorizeAction(["tutor"]);
  const parsed = z
    .object({
      courseId: z.string().uuid(),
      caWeight: z.coerce.number<number>().int().min(0).max(100),
    })
    .safeParse(Object.fromEntries(data));
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Choose a course and a CA percentage between 0 and 100.",
    };
  const course = await getRecord<TutorCourseDetails>(
    "course",
    parsed.data.courseId,
  );
  if (!course) return { ok: false as const, error: "Course not found." };
  await saveRecord(
    "course",
    {
      ...course,
      assessmentPolicy: {
        caWeight: parsed.data.caWeight,
        examWeight: 100 - parsed.data.caWeight,
      },
    },
    course.id,
  );
  revalidatePath("/tutor/gradebook");
  revalidatePath("/student/grades");
  return { ok: true as const };
}
