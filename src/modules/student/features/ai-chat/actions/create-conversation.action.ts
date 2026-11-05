"use server";
import { authorizeAction } from "@/shared/security/action";
import { requireRole } from "@/shared/rbac";

import { redirect } from "next/navigation";

import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import { createConversation } from "../services/ai-chat.service";

export async function createConversationAction(): Promise<void> {
  await authorizeAction(["student"]);
  await requireRole(["student"]);
  const conversation = await createConversation();
  redirect(STUDENT_ROUTES.aiChatConversation(conversation.id));
}
