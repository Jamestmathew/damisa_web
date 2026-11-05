/**
 * Shared AI domain types.
 *
 * This is the seam between the three AI-touching roles:
 *  - Student  reads  ChatConversation/ChatMessage/Citation (consumes AI)
 *  - Tutor    writes KnowledgeDocument (manages AI knowledge per course)
 *  - Admin    writes AiGovernancePolicy (controls what's allowed platform-wide)
 *
 * Nothing here hardcodes Admin as the top of the hierarchy: `AiGovernancePolicy`
 * is just "the effective policy for this tenant", currently sourced from
 * Admin. A future Super Admin module can introduce a platform-level policy
 * that Admin's policy narrows, without changing this shape or any of the
 * role modules that already depend on it — see `AiProviderConfig` and
 * `tenantId` below, which exist now specifically so that slot is open.
 */

// ---- Reserved for a future Super Admin module (not implemented yet) ----

/** Which LLM/embedding backend serves requests. Configured platform-wide later. */
export interface AiProviderConfig {
  providerId: string;
  displayName: string;
  isDefault: boolean;
}

/** Placeholder for multi-tenant deployments; every AI record already carries this. */
export type TenantId = string | null;

// ---- Governance (owned by Admin today, narrowed by Super Admin later) ----

export interface AiGovernancePolicy {
  tenantId: TenantId;
  aiFeaturesEnabled: boolean;
  studentChatEnabled: boolean;
  tutorKnowledgeBaseEnabled: boolean;
  allowedUploadTypes: string[];
  maxUploadSizeMb: number;
  storageQuotaGb: number;
  storageUsedGb: number;
}

// ---- Knowledge Base (owned by Tutor, per course) ----

export type DocumentProcessingStatus = "queued" | "processing" | "indexed" | "failed";

export interface KnowledgeDocument {
  id: string;
  tenantId: TenantId;
  courseId: string;
  courseTitle: string;
  fileName: string;
  fileType: string;
  fileSizeMb: number;
  uploadedAt: string;
  processingStatus: DocumentProcessingStatus;
  chunkCount: number | null;
  lastIndexedAt: string | null;
}

// ---- Chat (owned by Student) ----

export interface ChatCitation {
  id: string;
  documentName: string;
  courseTitle: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  tenantId: TenantId;
  title: string;
  courseTitle: string | null;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatConversationSummary {
  id: string;
  title: string;
  courseTitle: string | null;
  updatedAt: string;
  lastMessagePreview: string;
}
