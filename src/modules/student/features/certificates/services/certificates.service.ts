import "server-only";
import { createHash } from "node:crypto";
import { getCourses } from "@/modules/student/features/courses/services/courses.service";
import { getContext } from "@/shared/security/context";
import { listRecords } from "@/shared/data/records";
import type { Certificate } from "../types";
export async function getCertificates(): Promise<Certificate[]> {
  const { user } = await getContext();
  const courses = await getCourses();
  const progress = await listRecords<{ courseId: string; completedAt: string }>(
    "lesson_progress",
  );
  return courses
    .filter(
      (c) =>
        c.progressPercent === 100 && c.modules.some((m) => m.lessonCount > 0),
    )
    .map((c) => ({
      id: c.id,
      courseTitle: c.title,
      courseCode: c.code,
      issuedAt:
        progress
          .filter((p) => p.courseId === c.id)
          .map((p) => p.completedAt)
          .sort()
          .at(-1) ?? "",
      credentialId: `LMS-${createHash("sha256").update(`${user.id}:${c.id}`).digest("hex").slice(0, 20).toUpperCase()}`,
    }));
}
