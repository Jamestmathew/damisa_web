import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/modules/student/shared/components";
import { CalendarCheck } from "lucide-react";
import type { AttendanceMark, AttendanceRecord } from "../types";

const MARK_LABEL: Record<AttendanceMark, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
};

const MARK_VARIANT: Record<AttendanceMark, "success" | "destructive" | "secondary" | "outline"> = {
  present: "success",
  absent: "destructive",
  late: "secondary",
  excused: "outline",
};

export function AttendanceTable({ records }: { records: AttendanceRecord[] }) {
  if (records.length === 0) {
    return <EmptyState icon={CalendarCheck} title="No attendance records yet" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{record.date}</TableCell>
            <TableCell>
              <p className="font-medium text-foreground">{record.courseCode}</p>
              <p className="text-xs text-muted-foreground">{record.courseTitle}</p>
            </TableCell>
            <TableCell>
              <Badge variant={MARK_VARIANT[record.mark]}>{MARK_LABEL[record.mark]}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
