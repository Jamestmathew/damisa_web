import { getStaffAnnouncements } from "@/shared/data/admin-announcements";
import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  getTutorAnnouncements,
  TutorAnnouncementsManager,
} from "@/modules/tutor/features/announcements";
import { getTutorCourses } from "@/modules/tutor/features/courses/services/courses.service";

export const metadata: Metadata = { title: "Announcements" };

export default async function TutorAnnouncementsPage() {
  const received = await getStaffAnnouncements();
  const [announcements, courses] = await Promise.all([
    getTutorAnnouncements(),
    getTutorCourses(),
  ]);

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Post updates to students in your courses"
      />
      <section className="mb-6 space-y-3">
        <h2 className="font-semibold">From Admin</h2>
        {received.length ? (
          received.map((a) => (
            <article key={a.id} className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">{a.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {a.body}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No staff announcements from Admin yet.
          </p>
        )}
      </section>
      <TutorAnnouncementsManager
        announcements={announcements}
        courseOptions={courses.map((c) => ({
          id: c.id,
          label: `${c.code} · ${c.title}`,
        }))}
      />
    </div>
  );
}
