import type { Metadata } from "next";

import { getAiGovernancePolicy } from "@/shared/ai/services/ai-governance.service";
import { getConversations, ChatConversationList, AiChatDisabledNotice } from "@/modules/student/features/ai-chat";

export const metadata: Metadata = { title: "AI Chat" };

export default async function AiChatPage() {
  const policy = await getAiGovernancePolicy();

  if (!policy.aiFeaturesEnabled || !policy.studentChatEnabled) {
    return <AiChatDisabledNotice />;
  }

  const conversations = await getConversations();

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-border">
      <div className="w-72 shrink-0 border-r border-border">
        <ChatConversationList conversations={conversations} />
      </div>
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Select a conversation or start a new one to begin.
      </div>
    </div>
  );
}
