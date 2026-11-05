import "server-only";
import { createAdminClient } from "@/supabase/admin";
import { getContext } from "@/shared/security/context";
import { enforceRateLimit } from "@/shared/security/rate-limit";
import { cacheRequest } from "@/shared/security/request-cache";
import { imageType, MAX_IMAGE_BYTES } from "./image-policy";
export const MEDIA_BUCKET = "lms-media";
async function ensureBucket() {
  const db = createAdminClient();
  const existing = await db.storage.getBucket(MEDIA_BUCKET);
  if (!existing.error) {
    if (existing.data.public)
      throw new Error("The image bucket must be private.");
    return;
  }
  const created = await db.storage.createBucket(MEDIA_BUCKET, {
    public: false,
    fileSizeLimit: MAX_IMAGE_BYTES,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
  if (created.error && (await db.storage.getBucket(MEDIA_BUCKET)).error)
    throw new Error("Image storage is unavailable.");
}
export async function uploadImage(file: File, folder: string) {
  const { user, officeId } = await getContext();
  if (!folder.startsWith(`${officeId}/`))
    throw new Error("Image upload access denied.");
  if (!file.size || file.size > MAX_IMAGE_BYTES)
    throw new Error("Choose an image up to 3 MB.");
  await enforceRateLimit("image-upload", user.id, 10, 3600);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = imageType(bytes);
  await ensureBucket();
  const path = `${folder}/${crypto.randomUUID()}.${type.extension}`;
  const { error } = await createAdminClient()
    .storage.from(MEDIA_BUCKET)
    .upload(path, bytes, { contentType: type.mime, upsert: false });
  if (error) throw new Error("Unable to upload the picture.");
  return path;
}
export async function removeImage(path: string) {
  const { officeId } = await getContext();
  if (!path.startsWith(`${officeId}/`)) throw new Error("Image access denied.");
  const { error } = await createAdminClient()
    .storage.from(MEDIA_BUCKET)
    .remove([path]);
  if (error) throw new Error("Unable to remove the previous picture.");
}
export const courseCoverUrl = cacheRequest(
  async (courseId: string, path?: string) => {
    if (!path) return undefined;
    const { officeId } = await getContext();
    if (!path.startsWith(`${officeId}/courses/${courseId}/`)) return undefined;
    const { data, error } = await createAdminClient()
      .storage.from(MEDIA_BUCKET)
      .createSignedUrl(path, 3600);
    return error ? undefined : data.signedUrl;
  },
);
