import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus, ScheduleStatus } from "@/modules/student/shared/types";

const SUBMISSION_LABEL: Record<SubmissionStatus, string> = {
  not_submitted: "Not submitted",
  submitted: "Submitted",
  graded: "Graded",
  late: "Late",
  missed: "Missed",
};

const SUBMISSION_VARIANT: Record<SubmissionStatus, "secondary" | "success" | "destructive" | "outline"> = {
  not_submitted: "outline",
  submitted: "secondary",
  graded: "success",
  late: "destructive",
  missed: "destructive",
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return <Badge variant={SUBMISSION_VARIANT[status]}>{SUBMISSION_LABEL[status]}</Badge>;
}

const SCHEDULE_LABEL: Record<ScheduleStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  missed: "Missed",
};

const SCHEDULE_VARIANT: Record<ScheduleStatus, "secondary" | "success" | "destructive" | "outline"> = {
  upcoming: "outline",
  ongoing: "secondary",
  completed: "success",
  missed: "destructive",
};

export function ScheduleStatusBadge({ status }: { status: ScheduleStatus }) {
  return <Badge variant={SCHEDULE_VARIANT[status]}>{SCHEDULE_LABEL[status]}</Badge>;
}
