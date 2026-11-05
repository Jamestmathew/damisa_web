import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/modules/student/shared/components";
import { BarChart3 } from "lucide-react";
import type { CourseGradeRow } from "../types";

export function GradesTable({ rows }: { rows: CourseGradeRow[] }) {
  if (rows.length === 0) {
    return <EmptyState icon={BarChart3} title="No grades recorded yet" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Assessment</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Weight</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <p className="font-medium text-foreground">{row.courseCode}</p>
              <p className="text-xs text-muted-foreground">{row.courseTitle}</p>
            </TableCell>
            <TableCell>{row.assessment}</TableCell>
            <TableCell>
              {row.score}/{row.maxScore}
            </TableCell>
            <TableCell>{row.weightPercent}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
