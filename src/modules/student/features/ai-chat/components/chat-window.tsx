"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/shared/components";
import { FormStatusMessage } from "@/modules/auth/components/ui";

import { sendChatMessageAction } from "../actions/send-message.action";
import type { ChatConversation, ChatMessage } from "../types";

import { ChatMessageBubble } from "./chat-message-bubble";

export function ChatWindow({ conversation }: { conversation: ChatConversation }) {
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const content = draft.trim();
    if (!content) return;

    setError(null);
    const optimisticUserMessage: ChatMessage = {
      id: `optimistic_${Date.now()}`,
      role: "user",
      content,
      createdAt: "Just now",
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setDraft("");

    startTransition(async () => {
      const result = await sendChatMessageAction(conversation.id, content);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessages((prev) => [...prev, result.message]);
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Ask anything about your courses"
            description="Answers are grounded in materials your tutors have uploaded."
          />
        ) : (
          messages.map((message) => <ChatMessageBubble key={message.id} message={message} />)
        )}
        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 animate-pulse" />
            Thinking...
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <div className="px-4">
          <FormStatusMessage variant="error" message={error} />
        </div>
      ) : null}

      <div className="flex items-end gap-2 border-t border-border p-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a question about your course..."
          rows={2}
          className="flex-1 resize-none"
        />
        <Button onClick={handleSend} disabled={isPending || !draft.trim()} aria-label="Send message">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
