import "server-only";
import { requireRole } from "@/shared/rbac";
import type { PolicyDocument } from "../types";
export async function getPolicyDocuments(): Promise<PolicyDocument[]> {
  await requireRole(["super_admin"]);
  return [];
}
export async function uploadPolicyDocument(_input: {
  title: string;
  fileName: string;
  fileType: string;
  fileSizeMb: number;
}): Promise<
  { ok: true; policy: PolicyDocument } | { ok: false; error: string }
> {
  await requireRole(["super_admin"]);
  return {
    ok: false,
    error: "Policy ingestion will be enabled with the RAG integration.",
  };
}
export async function deletePolicyDocument(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole(["super_admin"]);
  return { ok: false, error: "Policy storage is not configured yet." };
}
