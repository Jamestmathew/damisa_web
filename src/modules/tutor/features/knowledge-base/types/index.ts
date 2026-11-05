export type { KnowledgeDocument, DocumentProcessingStatus } from "@/shared/ai";

export type KnowledgeBaseActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export interface TestChatExchange {
  id: string;
  question: string;
  answer: string;
}
