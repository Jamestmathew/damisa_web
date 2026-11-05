"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { updateAiGovernancePolicy } from "@/shared/ai/services/ai-governance.service";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { aiGovernanceFormSchema } from "../validation/ai-governance-form.schema";

export type AiGovernanceActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function saveAiGovernanceAction(
  _prevState: AiGovernanceActionResult | null,
  formData: FormData,
): Promise<AiGovernanceActionResult> {
  await authorizeAction(["admin"]);
  await requirePermission("ai:manage_governance");

  try {
    const parsed = aiGovernanceFormSchema.safeParse({
      aiFeaturesEnabled: formData.get("aiFeaturesEnabled") === "on",
      studentChatEnabled: formData.get("studentChatEnabled") === "on",
      tutorKnowledgeBaseEnabled:
        formData.get("tutorKnowledgeBaseEnabled") === "on",
      maxUploadSizeMb: formData.get("maxUploadSizeMb"),
      storageQuotaGb: formData.get("storageQuotaGb"),
      allowedUploadTypes: formData.getAll("allowedUploadTypes"),
    });

    if (!parsed.success) {
      return { ok: false, error: "Please fix the errors below" };
    }

    await updateAiGovernancePolicy(parsed.data);
    revalidatePath(ADMIN_ROUTES.aiGovernance);

    return { ok: true, message: "AI governance settings saved." };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
