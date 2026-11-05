import { Sparkles, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "../types";

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex gap-3", !isAssistant && "flex-row-reverse")}>
      {isAssistant ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-4 text-primary" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[80%] space-y-2",
          !isAssistant && "flex flex-col items-end",
        )}
      >
        <div
          className={cn(
            "rounded-lg px-4 py-2.5 text-sm",
            isAssistant
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground",
          )}
        >
          {message.content}
        </div>

        {message.citations && message.citations.length > 0 ? (
          <div className="space-y-1.5">
            {message.citations.map((citation) => (
              <div
                key={citation.id}
                className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs"
              >
                <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {citation.documentName}
                  </p>
                  <p className="text-muted-foreground">
                    {citation.courseTitle}
                  </p>
                  <p className="mt-1 italic text-muted-foreground">
                    &quot;{citation.snippet}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
