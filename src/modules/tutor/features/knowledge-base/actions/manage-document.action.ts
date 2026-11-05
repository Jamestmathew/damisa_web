"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import {
  deleteDocument,
  reindexDocument,
} from "../services/knowledge-base.service";

export async function deleteDocumentAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["tutor"]);
  await requirePermission("ai:manage_knowledge_base");

  const result = await deleteDocument(id);

  if (result.ok) revalidatePath(TUTOR_ROUTES.knowledgeBase);

  return result;
}

export async function reindexDocumentAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["tutor"]);
  await requirePermission("ai:manage_knowledge_base");

  const result = await reindexDocument(id);

  if (result.ok) revalidatePath(TUTOR_ROUTES.knowledgeBase);

  return result;
}
