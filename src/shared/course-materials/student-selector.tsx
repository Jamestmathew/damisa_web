"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveCourseStudentsAction } from "./student-selection.action";
export function CourseStudentSelector({
  courseId,
  students,
  initialSelected,
}: {
  courseId: string;
  students: { id: string; name: string; matricNumber: string | null }[];
  initialSelected: string[];
}) {
  const [selected, setSelected] = useState(initialSelected),
    [pending, start] = useTransition(),
    [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <section className="space-y-3 rounded-lg border bg-card p-5">
      <h2 className="font-semibold">Students for this course</h2>
      <p className="text-sm text-muted-foreground">
        Choose which students assigned to you should receive this course. They
        see it after you publish it.
      </p>
      {!students.length && (
        <p className="text-sm text-muted-foreground">
          Ask Admin to assign students to you first.
        </p>
      )}
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {students.map((s) => (
          <label
            key={s.id}
            className="flex items-center gap-3 rounded-md border p-3 text-sm"
          >
            <input
              type="checkbox"
              checked={selected.includes(s.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? [...selected, s.id]
                    : selected.filter((id) => id !== s.id),
                )
              }
            />
            <span>
              {s.name}{" "}
              <span className="text-muted-foreground">{s.matricNumber}</span>
            </span>
          </label>
        ))}
      </div>
      <Button
        disabled={pending || !students.length}
        onClick={() =>
          start(async () => {
            try {
              const result = await saveCourseStudentsAction(courseId, selected);
              setMessage(
                result.ok ? "Course student selection saved." : result.error,
              );
              if (result.ok) router.refresh();
            } catch {
              setMessage("Unable to save. Sign in and retry.");
            }
          })
        }
      >
        {pending ? "Saving…" : "Save selected students"}
      </Button>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
