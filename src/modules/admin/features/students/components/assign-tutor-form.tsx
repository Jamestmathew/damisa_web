"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { assignTutorAction } from "../actions/assign-tutor.action";
export function AssignTutorForm({
  students,
  tutors,
  assignments,
}: {
  students: { id: string; name: string }[];
  tutors: { id: string; name: string }[];
  assignments: { studentId: string; tutorId: string; tutorName: string }[];
}) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <section className="mb-6 space-y-4 rounded-lg border bg-card p-5">
      <h2 className="font-semibold">Assign students to tutors</h2>
      <p className="text-sm text-muted-foreground">
        The tutor will choose the courses each assigned student needs. Draft
        courses remain private.
      </p>
      <form
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        action={(data) =>
          start(async () => {
            const result = await assignTutorAction(data);
            setMessage(result.ok ? "Tutor assignment saved." : result.error);
            if (result.ok) router.refresh();
          })
        }
      >
        <label className="text-sm">
          Student
          <select
            required
            name="studentId"
            className="mt-1 h-10 w-full rounded-md border bg-background px-2"
          >
            <option value="">Choose student</option>
            {students.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Tutor
          <select
            name="tutorId"
            className="mt-1 h-10 w-full rounded-md border bg-background px-2"
          >
            <option value="">No tutor / remove assignment</option>
            {tutors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <Button className="self-end" disabled={pending}>
          {pending ? "Saving…" : "Save assignment"}
        </Button>
      </form>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      <ul className="space-y-1 text-sm">
        {assignments.map((a) => (
          <li key={a.studentId}>
            {students.find((s) => s.id === a.studentId)?.name ?? "Student"}{" "}
            <span className="text-muted-foreground">
              → {a.tutorName || "Unassigned"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
