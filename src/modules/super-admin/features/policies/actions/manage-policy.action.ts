"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { getAiGovernancePolicy } from "@/shared/ai/services/ai-governance.service";
import { SUPER_ADMIN_ROUTES } from "@/modules/super-admin/shared/constants";
import {
  uploadPolicyDocument,
  deletePolicyDocument,
} from "../services/policies.service";
import type { PolicyActionResult } from "../types";

export async function uploadPolicyAction(
  _prevState: PolicyActionResult | null,
  formData: FormData,
): Promise<PolicyActionResult> {
  await authorizeAction(["super_admin"]);
  await requirePermission("ai:manage_policies");

  const governance = await getAiGovernancePolicy();
  const title = String(formData.get("title") ?? "").trim();
  const fileName = String(formData.get("fileName") ?? "").trim();
  const fileType = String(formData.get("fileType") ?? "").toLowerCase();
  const fileSizeMb = Number(formData.get("fileSizeMb") ?? 0);

  if (!title) return { ok: false, error: "Please enter a title." };
  if (!fileName) return { ok: false, error: "Please choose a file to upload." };
  if (!governance.allowedUploadTypes.includes(fileType)) {
    return {
      ok: false,
      error: `File type must be one of: ${governance.allowedUploadTypes.join(", ")}`,
    };
  }
  if (fileSizeMb > governance.maxUploadSizeMb) {
    return {
      ok: false,
      error: `File must be smaller than ${governance.maxUploadSizeMb}MB`,
    };
  }

  const result = await uploadPolicyDocument({
    title,
    fileName,
    fileType,
    fileSizeMb,
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(SUPER_ADMIN_ROUTES.policies);
  return { ok: true, message: "Policy uploaded and queued for indexing." };
}

export async function deletePolicyAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["super_admin"]);
  await requirePermission("ai:manage_policies");

  const result = await deletePolicyDocument(id);

  if (result.ok) revalidatePath(SUPER_ADMIN_ROUTES.policies);

  return result;
}
