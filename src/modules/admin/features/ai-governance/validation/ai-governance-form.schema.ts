import { z } from "zod";

export const aiGovernanceFormSchema = z.object({
  aiFeaturesEnabled: z.boolean(),
  studentChatEnabled: z.boolean(),
  tutorKnowledgeBaseEnabled: z.boolean(),
  maxUploadSizeMb: z.coerce
    .number<number>()
    .int()
    .positive("Must be greater than zero"),
  storageQuotaGb: z.coerce
    .number<number>()
    .int()
    .positive("Must be greater than zero"),
  allowedUploadTypes: z
    .array(z.string())
    .min(1, "Select at least one file type"),
});

export type AiGovernanceFormSchema = z.infer<typeof aiGovernanceFormSchema>;
