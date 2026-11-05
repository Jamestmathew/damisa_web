import "server-only";
import { listRecords, saveRecord } from "@/shared/data/records";
import type { AiGovernancePolicy } from "../types";
const defaults: AiGovernancePolicy = {
  tenantId: null,
  aiFeaturesEnabled: false,
  studentChatEnabled: false,
  tutorKnowledgeBaseEnabled: false,
  allowedUploadTypes: ["pdf", "docx", "pptx", "txt", "md"],
  maxUploadSizeMb: 25,
  storageQuotaGb: 0,
  storageUsedGb: 0,
};
export async function getAiGovernancePolicy(): Promise<AiGovernancePolicy> {
  const stored = (await listRecords<AiGovernancePolicy>("ai_governance"))[0];
  return {
    ...defaults,
    ...stored,
    aiFeaturesEnabled: false,
    studentChatEnabled: false,
    tutorKnowledgeBaseEnabled: false,
  };
}
export async function updateAiGovernancePolicy(
  input: Partial<Omit<AiGovernancePolicy, "tenantId" | "storageUsedGb">>,
) {
  const row = (await listRecords("ai_governance"))[0];
  const policy = {
    ...defaults,
    ...input,
    aiFeaturesEnabled: false,
    studentChatEnabled: false,
    tutorKnowledgeBaseEnabled: false,
  };
  await saveRecord("ai_governance", policy, row?.id);
  return { ok: true as const, policy };
}
