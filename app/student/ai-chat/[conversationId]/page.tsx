import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAiGovernancePolicy } from "@/shared/ai/services/ai-governance.service";
import {
  getConversations,
  getConversationById,
  ChatConversationList,
  ChatWindow,
  AiChatDisabledNotice,
} from "@/modules/student/features/ai-chat";

export const metadata: Metadata = { title: "AI Chat" };

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function AiChatConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const policy = await getAiGovernancePolicy();

  if (!policy.aiFeaturesEnabled || !policy.studentChatEnabled) {
    return <AiChatDisabledNotice />;
  }

  const [conversations, conversation] = await Promise.all([
    getConversations(),
    getConversationById(conversationId),
  ]);

  if (!conversation) notFound();

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-border">
      <div className="w-72 shrink-0 border-r border-border">
        <ChatConversationList conversations={conversations} activeId={conversationId} />
      </div>
      <div className="flex-1">
        <ChatWindow conversation={conversation} />
      </div>
    </div>
  );
}
