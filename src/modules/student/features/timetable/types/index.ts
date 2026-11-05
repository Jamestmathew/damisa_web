export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

export interface TimetableSlot {
  id: string;
  day: Weekday;
  startTime: string;
  endTime: string;
  courseTitle: string;
  courseCode: string;
  venue: string;
}
