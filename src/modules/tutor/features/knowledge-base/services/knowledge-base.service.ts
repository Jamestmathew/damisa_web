import "server-only";
import { listRecords, deleteRecord } from "@/shared/data/records";
import type { KnowledgeDocument } from "@/shared/ai";
export async function getKnowledgeDocuments() {
  return listRecords<KnowledgeDocument>("ai_document");
}
export async function uploadDocument(_input: {
  courseId: string;
  courseTitle: string;
  fileName: string;
  fileType: string;
  fileSizeMb: number;
}): Promise<
  { ok: true; document: KnowledgeDocument } | { ok: false; error: string }
> {
  return {
    ok: false,
    error: "Document ingestion will be enabled with the RAG integration.",
  };
}
export async function deleteDocument(id: string) {
  await deleteRecord("ai_document", id);
  return { ok: true as const };
}
export async function reindexDocument(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return { ok: false, error: "Document indexing is not configured yet." };
}
export async function testCourseAi(
  _question: string,
): Promise<{ answer: string }> {
  return { answer: "Course AI is not configured yet." };
}
