export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

export interface TutorScheduleSlot {
  id: string;
  day: Weekday;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseTitle: string;
  venue: string;
}
