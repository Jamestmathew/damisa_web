import { FileBarChart, Download } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components";
import type { ReportSummary } from "../types";

const CATEGORY_LABEL: Record<ReportSummary["category"], string> = {
  academic: "Academic",
  financial: "Financial",
  attendance: "Attendance",
};

export function ReportsList({ reports }: { reports: ReportSummary[] }) {
  if (reports.length === 0) {
    return <EmptyState icon={FileBarChart} title="No reports available" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{CATEGORY_LABEL[report.category]}</Badge>
              <span className="text-xs text-muted-foreground">
                {report.generatedAt}
              </span>
            </div>
            <CardTitle className="text-base">{report.title}</CardTitle>
            <CardDescription>{report.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <a href={`/admin/reports/${report.category}/export`}>
                <Download className="size-4" />
                Export CSV
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
