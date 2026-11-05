import "server-only";
import { listRecords } from "./records";
import type { AdminClass } from "@/modules/admin/features/classes/types";
import type { TimetableSlot } from "@/modules/student/features/timetable/types";
import { parseClassSchedule } from "@/shared/security/policy";
export async function getClassSchedule(): Promise<TimetableSlot[]> {
  const [classes, courses] = await Promise.all([
    listRecords<AdminClass>("class"),
    listRecords<{ title: string; code: string }>("course"),
  ]);
  return classes.flatMap((c) => {
    const parsed = parseClassSchedule(c.schedule);
    return (c.courseIds ?? []).flatMap((id) => {
      const course = courses.find((k) => k.id === id);
      return course && parsed
        ? parsed.days.map((day) => ({
            id: `${c.id}:${id}:${day}`,
            day,
            startTime: parsed.startTime,
            endTime: parsed.endTime,
            venue: parsed.venue,
            courseCode: course.code,
            courseTitle: course.title,
          }))
        : [];
    });
  });
}
