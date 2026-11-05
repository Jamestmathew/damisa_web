import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getTutorAnnouncements, TutorAnnouncementsManager } from "@/modules/tutor/features/announcements";
import { getTutorCourses } from "@/modules/tutor/features/courses/services/courses.service";

export const metadata: Metadata = { title: "Announcements" };

export default async function TutorAnnouncementsPage() {
  const [announcements, courses] = await Promise.all([getTutorAnnouncements(), getTutorCourses()]);

  return (
    <div>
      <PageHeader title="Announcements" description="Post updates to students in your courses" />
      <TutorAnnouncementsManager
        announcements={announcements}
        courseOptions={courses.map((c) => ({ id: c.id, label: `${c.code} · ${c.title}` }))}
      />
    </div>
  );
}
