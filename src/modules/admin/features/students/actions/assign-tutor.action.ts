"use server";
import { authorizeAction } from "@/shared/security/action";
import { getOfficePeople } from "@/shared/data/people";
import { listRecords, saveRecord } from "@/shared/data/records";
import { revalidatePath } from "next/cache";
import type { TutorEnrollment } from "@/shared/data/tutor-enrollment";
export async function assignTutorAction(data: FormData) {
  await authorizeAction(["admin"]);
  const studentId = String(data.get("studentId") ?? "");
  const tutorId = String(data.get("tutorId") ?? "");
  try {
    const people = await getOfficePeople();
    const student = people.find(
      (person) => person.id === studentId && person.role === "student",
    );
    const tutor = people.find(
      (person) =>
        person.id === tutorId &&
        person.role === "tutor" &&
        person.status === "active",
    );
    if (!student || (tutorId && !tutor))
      return {
        ok: false,
        error: "Choose a student and active tutor in your office.",
      };
    const existing = (await listRecords<TutorEnrollment>("class")).find(
      (entry) =>
        entry.type === "tutor_assignment" &&
        entry.studentIds?.includes(studentId),
    );
    await saveRecord(
      "class",
      {
        ...existing,
        type: "tutor_assignment",
        name: `Tutor assignment: ${student.name}`,
        tutorId: tutor?.id ?? "",
        tutorName: tutor?.name ?? "",
        studentIds: [studentId],
        courseIds: [],
      },
      existing?.id,
    );
    revalidatePath("/", "layout");
    return { ok: true, error: "" };
  } catch {
    return { ok: false, error: "Unable to assign tutor. Refresh and retry." };
  }
}
