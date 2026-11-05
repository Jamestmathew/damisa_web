export type {
  ChatConversation,
  ChatConversationSummary,
  ChatMessage,
  ChatCitation,
} from "@/shared/ai";

export type SendMessageResult =
  | { ok: true; message: import("@/shared/ai").ChatMessage; conversationId: string }
  | { ok: false; error: string };
