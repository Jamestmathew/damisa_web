import { authorizeAction } from "@/shared/security/action";
import { getContext } from "@/shared/security/context";
import { getRecord } from "@/shared/data/records";
import { createAdminClient } from "@/supabase/admin";
import { SUBMISSION_BUCKET } from "@/shared/files/submission-storage";
import type { StoredSubmission } from "@/modules/tutor/features/assignments/services/assignments.service";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ submissionId: string; index: string }> },
) {
  await authorizeAction(["student", "tutor", "admin"]);
  const { submissionId, index } = await params;
  if (!/^\d+$/.test(index))
    return new Response("File not found", { status: 404 });
  const submission = await getRecord<StoredSubmission>(
    "submission",
    submissionId,
  );
  const file = submission?.attachments?.[Number(index)];
  const { officeId } = await getContext();
  if (
    !submission ||
    !file ||
    !file.path.startsWith(
      `${officeId}/assignments/${submission.assignmentId}/${submission.studentId}/`,
    )
  )
    return new Response("File not found", { status: 404 });
  const result = await createAdminClient()
    .storage.from(SUBMISSION_BUCKET)
    .download(file.path);
  if (result.error || !result.data)
    return new Response("File unavailable", { status: 404 });
  const name = encodeURIComponent(file.fileName).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16)}`,
  );
  return new Response(result.data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="assignment-file"; filename*=UTF-8''${name}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
