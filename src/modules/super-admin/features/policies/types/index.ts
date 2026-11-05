export type PolicyProcessingStatus = "queued" | "processing" | "indexed" | "failed";

export interface PolicyDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSizeMb: number;
  uploadedAt: string;
  processingStatus: PolicyProcessingStatus;
}

export type PolicyActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };
