import { collectRows } from "@/shared/data/pagination";
import "server-only";
import { getContext } from "@/shared/security/context";
import { getRecord, saveRecord } from "@/shared/data/records";
import { createAdminClient } from "@/supabase/admin";
import { enforceRateLimit } from "@/shared/security/rate-limit";
import {
  COURSE_FILES_BUCKET,
  MAX_COURSE_FILE_BYTES,
  COURSE_STORAGE_BUDGET,
  courseFileMetadata,
  reserveCourseSpace,
  validateCourseFileHeader,
  type CourseMaterial,
} from "./policy";
export interface MaterialCourse {
  id: string;
  materials?: CourseMaterial[];
}
async function managedCourse(id: string) {
  const context = await getContext();
  if (!["admin", "tutor"].includes(context.user.role))
    throw new Error("Only Admins and Tutors can upload course files.");
  const course = await getRecord<MaterialCourse>("course", id);
  if (!course) throw new Error("Course not found or access denied.");
  return { ...context, course };
}
async function ensureBucket() {
  const db = createAdminClient();
  let existing = await db.storage.getBucket(COURSE_FILES_BUCKET);
  if (existing.error) {
    await db.storage.createBucket(COURSE_FILES_BUCKET, {
      public: false,
      fileSizeLimit: MAX_COURSE_FILE_BYTES,
    });
    existing = await db.storage.getBucket(COURSE_FILES_BUCKET);
  }
  if (existing.error || !existing.data)
    throw new Error(
      "Course storage is unavailable. Check your Supabase storage configuration.",
    );
  if (existing.data.public)
    throw new Error("Course file storage must be private.");
  if (existing.data.file_size_limit !== MAX_COURSE_FILE_BYTES) {
    const updated = await db.storage.updateBucket(COURSE_FILES_BUCKET, {
      public: false,
      fileSizeLimit: MAX_COURSE_FILE_BYTES,
    });
    if (updated.error)
      throw new Error("Unable to configure the 3 MB upload limit.");
    return MAX_COURSE_FILE_BYTES;
  }
  return Math.min(
    existing.data.file_size_limit ?? MAX_COURSE_FILE_BYTES,
    MAX_COURSE_FILE_BYTES,
  );
}
export async function beginCourseUpload(
  courseId: string,
  name: string,
  size: number,
) {
  const { course, user, officeId } = await managedCourse(courseId);
  const metadata = courseFileMetadata(name, size);
  await enforceRateLimit("course-file-upload", user.id, 20, 3600);
  const storageLimit = await ensureBucket();
  if (size > storageLimit)
    throw new Error(
      `Storage currently allows up to ${Math.floor(storageLimit / 1e6)} MB per file. Choose a smaller file to stay within the Free-plan allowance.`,
    );
  const materials = course.materials ?? [];
  let entry = materials.find(
    (m) =>
      m.status === "pending" &&
      m.uploaderId === user.id &&
      m.fileName === metadata.fileName &&
      m.sizeBytes === size,
  );
  if (!entry) {
    reserveCourseSpace(materials, size);
    const courses = await collectRows<{
      payload: { materials?: CourseMaterial[] };
    }>(
      createAdminClient()
        .from("lms_records")
        .select("id,payload")
        .eq("kind", "course")
        .order("id"),
    );
    const reserved = courses.reduce(
      (sum, c) =>
        sum + (c.payload.materials ?? []).reduce((n, m) => n + m.sizeBytes, 0),
      0,
    );
    if (reserved + size > COURSE_STORAGE_BUDGET)
      throw new Error(
        "The shared course-file allowance is full. Remove unused files before uploading more.",
      );
    const id = crypto.randomUUID();
    entry = {
      ...metadata,
      id,
      path: `${officeId}/courses/${courseId}/${id}.${metadata.extension}`,
      status: "pending",
      uploaderId: user.id,
      createdAt: new Date().toISOString(),
    };
    await saveRecord(
      "course",
      { ...course, materials: [...materials, entry] },
      courseId,
    );
  }
  const storage = createAdminClient().storage.from(COURSE_FILES_BUCKET);
  const existing = await storage.info(entry.path);
  if (!existing.error)
    return { entry, alreadyUploaded: true, token: "", endpoint: "" };
  const signed = await storage.createSignedUploadUrl(entry.path, {
    upsert: false,
  });
  if (signed.error || !signed.data)
    throw new Error(
      "Unable to authorize this upload. Retry, or remove the pending upload.",
    );
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  if (
    url.hostname.endsWith(".supabase.co") &&
    !url.hostname.endsWith(".storage.supabase.co")
  )
    url.hostname = url.hostname.replace(".supabase.co", ".storage.supabase.co");
  url.pathname = "/storage/v1/upload/resumable/sign";
  return {
    entry,
    alreadyUploaded: false,
    token: signed.data.token,
    endpoint: url.toString(),
  };
}
export async function completeCourseUpload(
  courseId: string,
  materialId: string,
) {
  const { course, user } = await managedCourse(courseId);
  await enforceRateLimit("course-file-finalize", user.id, 30, 3600);
  const entry = course.materials?.find((m) => m.id === materialId);
  if (!entry) throw new Error("Upload reservation not found.");
  if (entry.status === "ready") return;
  const storage = createAdminClient().storage.from(COURSE_FILES_BUCKET);
  const info = await storage.info(entry.path);
  if (info.error || !info.data)
    throw new Error("Upload is not complete yet. Resume it and retry.");
  const rejectFile = async () => {
    await storage.remove([entry.path]);
    await saveRecord(
      "course",
      {
        ...course,
        materials: course.materials?.filter((m) => m.id !== entry.id),
      },
      courseId,
    );
  };
  if (
    Number(info.data.size) !== entry.sizeBytes ||
    entry.sizeBytes > MAX_COURSE_FILE_BYTES
  ) {
    await rejectFile();
    throw new Error("The uploaded file size does not match its reservation.");
  }
  const signed = await storage.createSignedUrl(entry.path, 60);
  if (signed.error || !signed.data)
    throw new Error(
      "Unable to verify the uploaded file. Use Finish / check to retry.",
    );
  const response = await fetch(signed.data.signedUrl, {
    headers: { Range: "bytes=0-511" },
    cache: "no-store",
  });
  if (!response.ok || !response.body)
    throw new Error(
      "Unable to verify file contents. Use Finish / check to retry.",
    );
  const reader = response.body.getReader();
  let bytes = new Uint8Array();
  try {
    while (bytes.length < 512) {
      const chunk = await reader.read();
      if (chunk.done) break;
      const combined = new Uint8Array(
        Math.min(512, bytes.length + chunk.value.length),
      );
      combined.set(bytes);
      combined.set(
        chunk.value.slice(0, combined.length - bytes.length),
        bytes.length,
      );
      bytes = combined;
    }
  } finally {
    await reader.cancel();
  }
  try {
    validateCourseFileHeader(entry.fileName, bytes);
  } catch (error) {
    await rejectFile();
    throw error;
  }
  await saveRecord(
    "course",
    {
      ...course,
      materials: course.materials?.map((m) =>
        m.id === materialId ? { ...m, status: "ready" as const } : m,
      ),
    },
    courseId,
  );
}
export async function removeCourseMaterial(courseId: string, id: string) {
  const { course } = await managedCourse(courseId);
  const entry = course.materials?.find((m) => m.id === id);
  if (!entry) throw new Error("Course file not found.");
  await saveRecord(
    "course",
    { ...course, materials: course.materials?.filter((m) => m.id !== id) },
    courseId,
  );
  await createAdminClient()
    .storage.from(COURSE_FILES_BUCKET)
    .remove([entry.path]);
}
