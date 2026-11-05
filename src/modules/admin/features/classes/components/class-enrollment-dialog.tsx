"use client";
import { useState, useTransition } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { enrollClassAction } from "../actions/enroll-class.action";
import type { AdminClass } from "../types";
export interface EnrollmentOption {
  id: string;
  name: string;
}
export function ClassEnrollmentDialog({
  classItem,
  students,
  courses,
}: {
  classItem: AdminClass;
  students: EnrollmentOption[];
  courses: EnrollmentOption[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Manage enrollment for ${classItem.name}`}
        >
          <Users className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Class enrollment</DialogTitle>
          <DialogDescription>
            Choose the students and courses for {classItem.name}. Students can
            access published courses assigned to their classes.
          </DialogDescription>
        </DialogHeader>
        <form
          action={(data) =>
            startTransition(async () => {
              setError("");
              try {
                await enrollClassAction(data);
                setOpen(false);
              } catch {
                setError("Unable to save enrollment. Refresh and try again.");
              }
            })
          }
          className="space-y-4"
        >
          <input type="hidden" name="classId" value={classItem.id} />
          <fieldset className="space-y-2">
            <legend className="font-semibold">Courses</legend>
            {courses.map((c) => (
              <label key={c.id} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  name="courseIds"
                  value={c.id}
                  defaultChecked={classItem.courseIds?.includes(c.id)}
                />
                {c.name}
              </label>
            ))}
            {!courses.length && (
              <p className="text-sm">A tutor must create a course first.</p>
            )}
          </fieldset>
          <fieldset className="max-h-56 space-y-2 overflow-y-auto">
            <legend className="font-semibold">Students</legend>
            {students.map((s) => (
              <label key={s.id} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  name="studentIds"
                  value={s.id}
                  defaultChecked={classItem.studentIds?.includes(s.id)}
                />
                {s.name}
              </label>
            ))}
            {!students.length && (
              <p className="text-sm">Create student accounts first.</p>
            )}
          </fieldset>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save enrollment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
