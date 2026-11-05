export const MAX_SUBMISSION_BYTES = 3 * 1024 * 1024;
export const MAX_SUBMISSION_FILES = 5;
export interface SubmissionFile {
  path: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}
export function submissionFileType(fileName: string, bytes: Uint8Array) {
  const extension = fileName.toLowerCase().split(".").at(-1);
  const mime: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip",
  };
  if (!extension || !mime[extension])
    throw new Error(
      "Supported files: PDF, PNG, JPEG, WebP, TXT, MD, CSV, DOCX, XLSX, PPTX, ZIP.",
    );
  if (!bytes.length || bytes.length > MAX_SUBMISSION_BYTES)
    throw new Error("Attachments must total 3 MB or less.");
  if (
    extension === "pdf" &&
    new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-"
  )
    throw new Error("This file is not a valid PDF.");
  if (
    ["docx", "xlsx", "pptx", "zip"].includes(extension) &&
    !(bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4)
  )
    throw new Error("This document is not a supported archive format.");
  if (["txt", "md", "csv"].includes(extension)) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (bytes.includes(0)) throw new Error();
    } catch {
      throw new Error("Text files must contain UTF-8 text.");
    }
  }
  if (
    extension === "png" &&
    ![137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n)
  )
    throw new Error("Invalid PNG picture.");
  if (
    ["jpg", "jpeg"].includes(extension) &&
    !(bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
  )
    throw new Error("Invalid JPEG picture.");
  if (
    extension === "webp" &&
    !(
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
    )
  )
    throw new Error("Invalid WebP picture.");
  return mime[extension];
}
