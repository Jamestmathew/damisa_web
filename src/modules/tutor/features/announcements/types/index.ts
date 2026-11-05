export interface TutorAnnouncement {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  body: string;
  postedAt: string;
}

export type TutorAnnouncementActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };
