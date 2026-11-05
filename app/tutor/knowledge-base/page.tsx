import type { Metadata } from "next";
import { ShieldOff } from "lucide-react";

import { PageHeader, EmptyState } from "@/shared/components";
import { getAiGovernancePolicy } from "@/shared/ai/services/ai-governance.service";
import {
  getKnowledgeDocuments,
  UploadDocumentForm,
  DocumentsTable,
  TestCourseAiPanel,
} from "@/modules/tutor/features/knowledge-base";
import { getTutorCourses } from "@/modules/tutor/features/courses/services/courses.service";

export const metadata: Metadata = { title: "AI Knowledge Base" };

export default async function KnowledgeBasePage() {
  const policy = await getAiGovernancePolicy();

  if (!policy.aiFeaturesEnabled || !policy.tutorKnowledgeBaseEnabled) {
    return (
      <div>
        <PageHeader title="AI Knowledge Base" description="Manage the course materials your AI draws from" />
        <EmptyState
          icon={ShieldOff}
          title="AI Knowledge Base is currently unavailable"
          description="Your institution has temporarily disabled this feature. Please check back later."
        />
      </div>
    );
  }

  const [documents, courses] = await Promise.all([getKnowledgeDocuments(), getTutorCourses()]);

  return (
    <div className="space-y-6">
      <PageHeader title="AI Knowledge Base" description="Manage the course materials your AI draws from" />

      <UploadDocumentForm
        courseOptions={courses.map((c) => ({ id: c.id, label: `${c.code} · ${c.title}` }))}
        allowedUploadTypes={policy.allowedUploadTypes}
        maxUploadSizeMb={policy.maxUploadSizeMb}
      />

      <DocumentsTable documents={documents} />

      <TestCourseAiPanel />
    </div>
  );
}
