export interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: "everyone" | "students" | "tutors" | "admins";
  postedAt: string;
}

export type AnnouncementActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };
