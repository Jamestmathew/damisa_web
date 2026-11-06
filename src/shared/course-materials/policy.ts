export const COURSE_MATERIAL_LIMIT = 150_000_000;
export const MAX_COURSE_FILE_BYTES = 3_000_000;
export const COURSE_STORAGE_BUDGET = 500_000_000;
export const COURSE_FILES_BUCKET = "course-materials";
export interface CourseMaterial {
  id: string;
  path: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  status: "pending" | "ready";
  uploaderId: string;
  createdAt: string;
}
const types: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  zip: "application/zip",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
};
export const COURSE_FILE_ACCEPT = Object.keys(types)
  .map((ext) => `.${ext}`)
  .join(",");
export function courseFileMetadata(name: string, size: number) {
  const fileName = name.replace(/[\\/\u0000-\u001f\u007f]/g, "_").trim();
  const extension = fileName.split(".").at(-1)?.toLowerCase() ?? "";
  if (!fileName || fileName.length > 180 || !types[extension])
    throw new Error(
      "Choose PDF, DOCX, PPTX, TXT, ZIP, MP4, WebM or MP3. Pictures are cover images, not course files.",
    );
  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_COURSE_FILE_BYTES)
    throw new Error(
      "Choose a file up to 3 MB. Each course allows up to 150 MB of files.",
    );
  return { fileName, sizeBytes: size, mimeType: types[extension], extension };
}
export function validateCourseFileHeader(name: string, bytes: Uint8Array) {
  const ext = name.split(".").at(-1)?.toLowerCase();
  const prefix = (...values: number[]) =>
    values.every((value, i) => bytes[i] === value);
  const text = new TextDecoder().decode(bytes, { stream: true });
  const valid =
    ext === "pdf"
      ? text.startsWith("%PDF-")
      : ext === "txt"
        ? !bytes.includes(0) && !text.includes("\uFFFD")
        : ["docx", "pptx", "zip"].includes(ext ?? "")
          ? prefix(80, 75, 3, 4) || prefix(80, 75, 5, 6) || prefix(80, 75, 7, 8)
          : ext === "mp4"
            ? new TextDecoder().decode(bytes.slice(4, 8)) === "ftyp"
            : ext === "webm"
              ? prefix(26, 69, 223, 163)
              : ext === "mp3"
                ? text.startsWith("ID3") ||
                  (bytes[0] === 255 && (bytes[1]! & 224) === 224)
                : false;
  if (!valid) throw new Error("The file contents do not match its file type.");
}
export function reserveCourseSpace(materials: CourseMaterial[], bytes: number) {
  if (materials.length >= 50)
    throw new Error("A course can contain up to 50 files.");
  if (materials.some((m) => m.status === "pending"))
    throw new Error(
      "Finish or remove the pending upload before adding another file.",
    );
  const used = materials.reduce((sum, m) => sum + m.sizeBytes, 0);
  if (used + bytes > COURSE_MATERIAL_LIMIT)
    throw new Error(
      "This upload would exceed the 150 MB total for this course.",
    );
}
export function formatCourseBytes(bytes: number) {
  return bytes >= 1e9
    ? `${(bytes / 1e9).toFixed(2)} GB`
    : bytes >= 1e6
      ? `${(bytes / 1e6).toFixed(1)} MB`
      : `${Math.ceil(bytes / 1000)} KB`;
}
