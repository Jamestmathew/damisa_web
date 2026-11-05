import { Sparkles } from "lucide-react";

import { EmptyState } from "@/shared/components";

export function AiChatDisabledNotice() {
  return (
    <EmptyState
      icon={Sparkles}
      title="AI Chat is currently unavailable"
      description="Course AI is being prepared. Chat will be available after the course knowledge base and AI provider are connected."
    />
  );
}
