import { getOptionalSession } from "@/modules/auth/lib/route-guard";
import { getRecord } from "@/shared/data/records";
import { createAdminClient } from "@/supabase/admin";
import { enforceRateLimit } from "@/shared/security/rate-limit";
import { COURSE_FILES_BUCKET } from "@/shared/course-materials/policy";
import type { MaterialCourse } from "@/shared/course-materials/service";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string; materialId: string }> },
) {
  const user = await getOptionalSession();
  if (!user) return new Response("Sign in required", { status: 401 });
  if (!["student", "tutor", "admin"].includes(user.role) || !user.officeId)
    return new Response("Access denied", { status: 403 });
  const { courseId, materialId } = await params;
  const course = await getRecord<MaterialCourse>("course", courseId);
  const material = course?.materials?.find(
    (m) => m.id === materialId && m.status === "ready",
  );
  if (
    !material ||
    !material.path.startsWith(`${user.officeId}/courses/${courseId}/`)
  )
    return new Response("Course file not found", { status: 404 });
  try {
    await enforceRateLimit("course-file-download", user.id, 60, 60);
  } catch {
    return new Response("Too many downloads. Try again shortly.", {
      status: 429,
    });
  }
  const result = await createAdminClient()
    .storage.from(COURSE_FILES_BUCKET)
    .createSignedUrl(material.path, 60, { download: material.fileName });
  if (result.error || !result.data)
    return new Response("File unavailable", { status: 404 });
  return new Response(null, {
    status: 303,
    headers: {
      Location: result.data.signedUrl,
      "Cache-Control": "private, no-store",
    },
  });
}
