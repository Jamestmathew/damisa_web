import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getAiGovernancePolicy } from "@/shared/ai/services/ai-governance.service";
import { getPolicyDocuments, UploadPolicyForm, PoliciesTable } from "@/modules/super-admin/features/policies";

export const metadata: Metadata = { title: "AI Policies" };

export default async function PoliciesPage() {
  const [policies, governance] = await Promise.all([getPolicyDocuments(), getAiGovernancePolicy()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Policies"
        description="Upload institutional policies to ground platform-wide AI answers"
      />
      <UploadPolicyForm
        allowedUploadTypes={governance.allowedUploadTypes}
        maxUploadSizeMb={governance.maxUploadSizeMb}
      />
      <PoliciesTable policies={policies} />
    </div>
  );
}
