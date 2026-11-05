export interface Announcement {
  id: string;
  title: string;
  body: string;
  courseTitle: string | null; // null = school-wide announcement
  postedAt: string;
  isPinned: boolean;
}
