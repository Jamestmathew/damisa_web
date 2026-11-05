import { OfficesDashboard } from "@/modules/super-admin/features/offices/components/offices-dashboard";
import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  getOffices,
  OfficesOverviewTable,
} from "@/modules/super-admin/features/offices";

export const metadata: Metadata = { title: "Offices" };

export default async function OfficesPage() {
  const offices = await getOffices();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offices"
        description="Revenue and enrollment totals per office"
      />
      <OfficesDashboard offices={offices} />
      <section aria-label="Office details" className="space-y-3">
        <h2 className="text-base font-semibold">Office details</h2>
        <OfficesOverviewTable offices={offices} />
      </section>
    </div>
  );
}
