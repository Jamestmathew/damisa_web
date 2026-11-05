import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getOffices, OfficesOverviewTable } from "@/modules/super-admin/features/offices";

export const metadata: Metadata = { title: "Offices" };

export default async function OfficesPage() {
  const offices = await getOffices();

  return (
    <div>
      <PageHeader title="Offices" description="Revenue and enrollment totals per office" />
      <OfficesOverviewTable offices={offices} />
    </div>
  );
}
