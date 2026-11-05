import "server-only";
import { listRecords, getRecord, saveRecord } from "@/shared/data/records";
import type {
  ChatConversation,
  ChatConversationSummary,
  ChatMessage,
} from "@/shared/ai";
export async function getConversations(): Promise<ChatConversationSummary[]> {
  return (await listRecords<ChatConversation>("ai_conversation")).map((c) => ({
    id: c.id,
    title: c.title,
    courseTitle: c.courseTitle,
    updatedAt: c.updatedAt,
    lastMessagePreview: c.messages.at(-1)?.content.slice(0, 80) ?? "",
  }));
}
export async function getConversationById(id: string) {
  return getRecord<ChatConversation>("ai_conversation", id);
}
export async function createConversation(): Promise<ChatConversation> {
  return saveRecord("ai_conversation", {
    id: "",
    tenantId: null,
    title: "New conversation",
    courseTitle: null,
    updatedAt: new Date().toISOString(),
    messages: [],
  });
}
export async function sendMessage(
  _conversationId: string,
  _content: string,
): Promise<{ ok: true; message: ChatMessage } | { ok: false; error: string }> {
  return {
    ok: false,
    error:
      "AI chat will be available when the course knowledge base and provider integration are configured.",
  };
}
