import Link from "next/link";
import { Plus, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/shared/components";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import { createConversationAction } from "../actions/create-conversation.action";
import type { ChatConversationSummary } from "../types";

export function ChatConversationList({
  conversations,
  activeId,
}: {
  conversations: ChatConversationSummary[];
  activeId?: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <form action={createConversationAction} className="p-3">
        <Button type="submit" className="w-full">
          <Plus className="size-4" />
          New conversation
        </Button>
      </form>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No conversations yet" />
        ) : (
          conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={STUDENT_ROUTES.aiChatConversation(conversation.id)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                conversation.id === activeId
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <p className="truncate font-medium text-foreground">{conversation.title}</p>
              <p className="truncate text-xs text-muted-foreground">{conversation.lastMessagePreview}</p>
              <p className="text-xs text-muted-foreground">{conversation.updatedAt}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
