import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getActivityLogs, ActivityLogTable } from "@/modules/admin/features/activity-logs";

export const metadata: Metadata = { title: "Activity Logs" };

export default async function ActivityLogsPage() {
  const logs = await getActivityLogs();

  return (
    <div>
      <PageHeader title="Activity Logs" description="A record of actions taken across the platform" />
      <ActivityLogTable logs={logs} />
    </div>
  );
}
