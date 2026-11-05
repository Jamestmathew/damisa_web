import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getTutorSchedule, TutorScheduleGrid } from "@/modules/tutor/features/schedule";

export const metadata: Metadata = { title: "Schedule" };

export default async function TutorSchedulePage() {
  const slots = await getTutorSchedule();

  return (
    <div>
      <PageHeader title="Schedule" description="Your weekly teaching schedule" />
      <TutorScheduleGrid slots={slots} />
    </div>
  );
}
