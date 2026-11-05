import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getAiGovernancePolicy } from "@/shared/ai/services/ai-governance.service";
import { AiGovernanceForm } from "@/modules/admin/features/ai-governance";

export const metadata: Metadata = { title: "AI Governance" };

export default async function AiGovernancePage() {
  const policy = await getAiGovernancePolicy();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="AI Governance"
        description="Control AI feature availability, upload limits, and storage across the platform"
      />
      <AiGovernanceForm policy={policy} />
    </div>
  );
}
