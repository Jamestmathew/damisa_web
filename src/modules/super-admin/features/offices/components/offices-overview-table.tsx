import { Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/shared/components";
import type { DataTableColumn } from "@/shared/types";
import type { Office } from "@/modules/super-admin/shared/types";

export function OfficesOverviewTable({ offices }: { offices: Office[] }) {
  const columns: DataTableColumn<Office>[] = [
    { key: "name", header: "Office", render: (office) => <span className="font-medium text-foreground">{office.name}</span> },
    {
      key: "admin",
      header: "Assigned Admin",
      render: (office) =>
        office.adminName ? (
          office.adminName
        ) : (
          <Badge variant="outline">Unassigned</Badge>
        ),
    },
    { key: "students", header: "Total Students", render: (office) => office.totalStudents.toLocaleString() },
    {
      key: "revenue",
      header: "Total Revenue",
      render: (office) => `₦${office.totalRevenueNaira.toLocaleString()}`,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={offices}
      getRowId={(office) => office.id}
      emptyIcon={Building2}
      emptyTitle="No offices found"
    />
  );
}
