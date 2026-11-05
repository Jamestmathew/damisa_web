"use server";
import { authorizeAction } from "@/shared/security/action";
import { requireRole } from "@/shared/rbac";

import { revalidatePath } from "next/cache";

import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import { getAiGovernancePolicy } from "@/shared/ai/services/ai-governance.service";
import { sendMessage } from "../services/ai-chat.service";
import type { SendMessageResult } from "../types";

export async function sendChatMessageAction(
  conversationId: string,
  content: string,
): Promise<SendMessageResult> {
  await authorizeAction(["student"]);
  await requireRole(["student"]);
  const policy = await getAiGovernancePolicy();

  if (!policy.aiFeaturesEnabled || !policy.studentChatEnabled) {
    return {
      ok: false,
      error: "AI Chat is currently disabled by your institution.",
    };
  }

  if (!content.trim()) {
    return { ok: false, error: "Please enter a message." };
  }

  const result = await sendMessage(conversationId, content.trim());

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath(STUDENT_ROUTES.aiChatConversation(conversationId));

  return { ok: true, message: result.message, conversationId };
}
