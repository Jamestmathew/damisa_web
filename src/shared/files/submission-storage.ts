import "server-only";
import { createAdminClient } from "@/supabase/admin";
import { getContext } from "@/shared/security/context";
import { enforceRateLimit } from "@/shared/security/rate-limit";
import {
  submissionFileType,
  MAX_SUBMISSION_BYTES,
  MAX_SUBMISSION_FILES,
  type SubmissionFile,
} from "./assignment-files";
export const SUBMISSION_BUCKET = "lms-submissions";
export async function uploadSubmissionFiles(
  assignmentId: string,
  files: File[],
): Promise<SubmissionFile[]> {
  const { user, officeId } = await getContext();
  if (user.role !== "student")
    throw new Error("Only students can upload submissions.");
  if (
    files.length > MAX_SUBMISSION_FILES ||
    files.reduce((n, f) => n + f.size, 0) > MAX_SUBMISSION_BYTES
  )
    throw new Error("Upload up to five files, totalling no more than 3 MB.");
  await enforceRateLimit("submission-files", user.id, 30, 3600);
  const db = createAdminClient();
  const bucket = await db.storage.getBucket(SUBMISSION_BUCKET);
  if (bucket.data?.public)
    throw new Error("The submission bucket must be private.");
  if (bucket.error) {
    const made = await db.storage.createBucket(SUBMISSION_BUCKET, {
      public: false,
      fileSizeLimit: MAX_SUBMISSION_BYTES,
    });
    if (made.error && (await db.storage.getBucket(SUBMISSION_BUCKET)).error)
      throw new Error("Assignment file storage is unavailable.");
  }
  const saved: SubmissionFile[] = [];
  try {
    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mimeType = submissionFileType(file.name, bytes);
      const path = `${officeId}/assignments/${assignmentId}/${user.id}/${crypto.randomUUID()}`;
      const result = await db.storage
        .from(SUBMISSION_BUCKET)
        .upload(path, bytes, { contentType: mimeType, upsert: false });
      if (result.error) throw new Error("Unable to upload an attachment.");
      saved.push({
        path,
        fileName: file.name.replace(/[\r\n\x00-\x1f]/g, "").slice(0, 150),
        mimeType,
        sizeBytes: file.size,
      });
    }
    return saved;
  } catch (error) {
    if (saved.length)
      await db.storage.from(SUBMISSION_BUCKET).remove(saved.map((f) => f.path));
    throw error;
  }
}
export async function removeSubmissionFiles(files: SubmissionFile[]) {
  const { user, officeId } = await getContext();
  const paths = files
    .filter(
      (f) =>
        f.path.startsWith(`${officeId}/assignments/`) &&
        f.path.includes(`/${user.id}/`),
    )
    .map((f) => f.path);
  if (paths.length)
    await createAdminClient().storage.from(SUBMISSION_BUCKET).remove(paths);
}
