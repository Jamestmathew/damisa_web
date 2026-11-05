import { EmptyState } from "@/modules/student/shared/components";
import { CalendarClock } from "lucide-react";
import type { TimetableSlot, Weekday } from "../types";

const DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function TimetableGrid({ slots }: { slots: TimetableSlot[] }) {
  if (slots.length === 0) {
    return <EmptyState icon={CalendarClock} title="No classes scheduled" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      {DAYS.map((day) => {
        const daySlots = slots
          .filter((slot) => slot.day === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <div key={day} className="space-y-2">
            <p className="text-sm font-semibold text-foreground">{day}</p>
            {daySlots.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                No classes
              </p>
            ) : (
              daySlots.map((slot) => (
                <div key={slot.id} className="rounded-md border border-border bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {slot.startTime} – {slot.endTime}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{slot.courseCode}</p>
                  <p className="text-xs text-muted-foreground">{slot.venue}</p>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
