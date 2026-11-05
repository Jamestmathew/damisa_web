import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import { getTimetable, TimetableGrid } from "@/modules/student/features/timetable";

export const metadata: Metadata = { title: "Timetable" };

export default async function TimetablePage() {
  const slots = await getTimetable();

  return (
    <div>
      <PageHeader title="Timetable" description="Your weekly class schedule" />
      <TimetableGrid slots={slots} />
    </div>
  );
}
