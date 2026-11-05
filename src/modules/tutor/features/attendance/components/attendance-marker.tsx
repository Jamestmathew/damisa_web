"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { saveAttendanceAction } from "../actions/save-attendance.action";
import type { AttendanceMark, AttendanceSession } from "../types";

const MARK_OPTIONS: { value: AttendanceMark; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
];

export function AttendanceMarker({ session }: { session: AttendanceSession }) {
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>(
    Object.fromEntries(
      session.students
        .filter((s) => s.mark !== null)
        .map((s) => [s.studentId, s.mark as AttendanceMark]),
    ),
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSave() {
    setSaved(false);
    setError("");
    startTransition(async () => {
      try {
        const result = await saveAttendanceAction(session.courseId, marks);
        if (result.ok) {
          setSaved(true);
        } else setError(result.error);
      } catch {
        setError("Unable to save attendance. Please retry.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Unmarked students are not saved as absent. Choose a mark for each
        student you want to record.
      </p>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {session.students.map((student) => (
        <Card key={student.studentId}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-foreground">
                {student.studentName}
              </p>
              {!marks[student.studentId] ? (
                <span className="text-xs text-muted-foreground">
                  Not marked
                </span>
              ) : null}
            </div>
            <div className="flex gap-1">
              {MARK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setMarks((prev) => ({
                      ...prev,
                      [student.studentId]: option.value,
                    }))
                  }
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    marks[student.studentId] === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input text-muted-foreground hover:bg-accent",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save attendance"}
        </Button>
        {saved ? <span className="text-sm text-success">Saved.</span> : null}
      </div>
    </div>
  );
}
