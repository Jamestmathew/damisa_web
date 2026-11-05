"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { getAiGovernancePolicy } from "@/shared/ai/services/ai-governance.service";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { buildUploadSchema } from "../validation/upload.schema";
import { uploadDocument } from "../services/knowledge-base.service";
import type { KnowledgeBaseActionResult } from "../types";

export async function uploadDocumentAction(
  _prevState: KnowledgeBaseActionResult | null,
  formData: FormData,
): Promise<KnowledgeBaseActionResult> {
  await authorizeAction(["tutor"]);
  await requirePermission("ai:manage_knowledge_base");

  const policy = await getAiGovernancePolicy();

  if (!policy.aiFeaturesEnabled || !policy.tutorKnowledgeBaseEnabled) {
    return {
      ok: false,
      error: "The AI Knowledge Base has been disabled by your institution.",
    };
  }

  const schema = buildUploadSchema(
    policy.allowedUploadTypes,
    policy.maxUploadSizeMb,
  );
  const fileType = String(formData.get("fileType") ?? "")
    .replace(/^\./, "")
    .toLowerCase();

  const parsed = schema.safeParse({
    courseId: formData.get("courseId"),
    fileName: formData.get("fileName"),
    fileType,
    fileSizeMb: formData.get("fileSizeMb"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid upload.",
    };
  }

  const courseTitle = String(formData.get("courseTitle") ?? "Course");

  const result = await uploadDocument({ ...parsed.data, courseTitle });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(TUTOR_ROUTES.knowledgeBase);
  return { ok: true, message: "Document uploaded and queued for processing." };
}
