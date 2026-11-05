import "server-only";
import { cacheRequest as cache } from "@/shared/security/request-cache";
import { collectRows } from "./pagination";
import { createAdminClient } from "@/supabase/admin";
import { getContext } from "@/shared/security/context";
import { enforceRateLimit } from "@/shared/security/rate-limit";
import type { Role } from "@/shared/rbac";

export type Kind =
  | "course"
  | "lesson"
  | "quiz"
  | "assignment"
  | "submission"
  | "quiz_attempt"
  | "quiz_session"
  | "lesson_progress"
  | "exam"
  | "attendance"
  | "announcement"
  | "payment"
  | "student_fee"
  | "department"
  | "class"
  | "admission"
  | "certificate"
  | "ai_document"
  | "ai_conversation"
  | "preferences"
  | "system_settings"
  | "ai_governance"
  | "activity_log"
  | "policy"
  | "grade_override"
  | "assessment_grade";
const recordRevision = "__revision";
export interface Row<T> {
  id: string;
  kind: Kind;
  office_id: string;
  owner_id: string;
  payload: T;
  revision: number;
  created_at: string;
  updated_at: string;
}
const privateKinds: Kind[] = [
  "submission",
  "quiz_attempt",
  "quiz_session",
  "lesson_progress",
  "ai_conversation",
  "preferences",
];
const teaching: Kind[] = [
  "course",
  "lesson",
  "quiz",
  "assignment",
  "exam",
  "ai_document",
];
const administrative: Kind[] = [
  "payment",
  "student_fee",
  "department",
  "class",
  "admission",
  "certificate",
  "system_settings",
  "ai_governance",
  "activity_log",
  "policy",
];

function mayWrite(kind: Kind, role: Role) {
  if (kind === "assessment_grade") return role === "tutor";
  if (kind === "preferences") return true;
  if (kind === "submission" && role === "tutor") return true;
  if (
    [
      "submission",
      "quiz_attempt",
      "quiz_session",
      "lesson_progress",
      "ai_conversation",
    ].includes(kind)
  )
    return role === "student";
  if (
    teaching.includes(kind) ||
    kind === "grade_override" ||
    kind === "attendance"
  )
    return role === "tutor" || role === "admin";
  if (kind === "announcement") return role === "admin" || role === "tutor";
  return (
    administrative.includes(kind) &&
    (role === "admin" || role === "super_admin")
  );
}

const requestRecords = cache(
  async () => new Map<Kind, Promise<Row<unknown>[]>>(),
);
export async function invalidateRecordCache() {
  (await requestRecords()).clear();
}
async function visibleRows<T>(kind: Kind): Promise<Row<T>[]> {
  const records = await requestRecords();
  let pending = records.get(kind);
  if (!pending) {
    pending = readVisibleRows(kind);
    records.set(kind, pending);
  }
  return pending as Promise<Row<T>[]>;
}
async function readVisibleRows<T>(kind: Kind): Promise<Row<T>[]> {
  const { user, officeId } = await getContext();
  if (
    user.role === "tutor" &&
    [
      "payment",
      "student_fee",
      "department",
      "admission",
      "certificate",
      "system_settings",
      "activity_log",
      "policy",
    ].includes(kind)
  )
    throw new Error("Access denied.");
  let query = createAdminClient()
    .from("lms_records")
    .select("*")
    .eq("office_id", officeId)
    .eq("kind", kind)
    .order("created_at");
  if (
    kind === "preferences" ||
    kind === "ai_conversation" ||
    (user.role === "student" && privateKinds.includes(kind))
  )
    query = query.eq("owner_id", user.id);
  if (
    user.role === "tutor" &&
    (teaching.includes(kind) ||
      kind === "grade_override" ||
      kind === "announcement")
  )
    query = query.eq("owner_id", user.id);
  let rows = await collectRows<Row<T>>(query);
  const payload = (row: Row<T>) => row.payload as Record<string, unknown>;
  if (kind === "announcement")
    rows = rows.filter(
      (r) =>
        !payload(r).audience ||
        payload(r).audience === "everyone" ||
        payload(r).audience === `${user.role}s` ||
        user.role === "admin",
    );
  if (user.role === "student") {
    if (
      ["department", "admission", "system_settings", "activity_log"].includes(
        kind,
      )
    )
      return [];
    if (kind === "class")
      rows = rows.filter((r) =>
        (payload(r).studentIds as string[] | undefined)?.includes(user.id),
      );
    if (kind === "course") {
      const classes = await visibleRows<{
        studentIds: string[];
        courseIds: string[];
      }>("class");
      const enrolled = new Set(
        classes.flatMap((c) => c.payload.courseIds ?? []),
      );
      rows = rows.filter(
        (r) => payload(r).status === "published" && enrolled.has(r.id),
      );
    }
    if (
      [
        "payment",
        "student_fee",
        "attendance",
        "certificate",
        "grade_override",
        "assessment_grade",
      ].includes(kind)
    )
      rows = rows.filter((r) => payload(r).studentId === user.id);
    if (
      ["lesson", "quiz", "assignment", "exam", "ai_document"].includes(kind)
    ) {
      const courses = new Set((await visibleRows("course")).map((c) => c.id));
      rows = rows.filter(
        (r) =>
          courses.has(String(payload(r).courseId)) &&
          (kind !== "lesson" || payload(r).published === true),
      );
    }
  }
  if (
    user.role === "tutor" &&
    [
      "submission",
      "quiz_attempt",
      "quiz_session",
      "lesson_progress",
      "attendance",
      "assessment_grade",
    ].includes(kind)
  ) {
    const courses = new Set((await visibleRows("course")).map((c) => c.id));
    rows = rows.filter((r) => courses.has(String(payload(r).courseId)));
  }
  if (user.role === "student" && kind === "announcement") {
    const courses = new Set((await visibleRows("course")).map((c) => c.id));
    rows = rows.filter(
      (r) => !payload(r).courseId || courses.has(String(payload(r).courseId)),
    );
  }
  if (user.role === "tutor" && kind === "class") {
    const courses = new Set((await visibleRows("course")).map((c) => c.id));
    rows = rows.filter((r) =>
      (payload(r).courseIds as string[] | undefined)?.some((id) =>
        courses.has(id),
      ),
    );
  }
  return rows;
}
export async function listRecords<T>(
  kind: Kind,
): Promise<(T & { id: string; __revision: number })[]> {
  return (await visibleRows<T>(kind)).map((r) => ({
    ...r.payload,
    id: r.id,
    [recordRevision]: r.revision,
  }));
}
export async function getRecord<T>(
  kind: Kind,
  id: string,
): Promise<(T & { id: string; __revision: number }) | null> {
  return (await listRecords<T>(kind)).find((r) => r.id === id) ?? null;
}
export async function saveRecord<T extends object>(
  kind: Kind,
  payload: T,
  id?: string,
) {
  const { user, officeId } = await getContext();
  if (!mayWrite(kind, user.role))
    throw new Error("You do not have permission to change this record.");
  await enforceRateLimit("write", user.id, 120, 60);
  const previous = id
    ? (await visibleRows<T>(kind)).find((r) => r.id === id)
    : undefined;
  if (id && !previous) throw new Error("Record not found or access denied.");
  const expectedRevision = (payload as Record<PropertyKey, unknown>)[
    recordRevision
  ];
  if (
    previous &&
    expectedRevision !== undefined &&
    expectedRevision !== previous.revision
  )
    throw new Error(
      "This record changed in another session. Refresh and retry.",
    );
  // A tutor's child records must point to one of their courses, on both create and update.
  const courseId = (payload as Record<string, unknown>).courseId;
  if (courseId && !(await getRecord("course", String(courseId))))
    throw new Error("Course not found or access denied.");
  if (kind === "submission" && user.role === "tutor") {
    if (!previous) throw new Error("Tutors cannot create student submissions.");
    const strip = (value: object) =>
      Object.fromEntries(
        Object.entries(value)
          .filter(
            ([key]) =>
              !["id", "__revision", "score", "status", "feedback"].includes(
                key,
              ),
          )
          .sort(([a], [b]) => a.localeCompare(b)),
      );
    if (
      JSON.stringify(strip(previous.payload)) !== JSON.stringify(strip(payload))
    )
      throw new Error("Tutors may only grade submissions.");
  }
  const db = createAdminClient();
  const suppliedId = (payload as Record<string, unknown>).id;
  const recordId =
    id ??
    (typeof suppliedId === "string" && /^[0-9a-f-]{36}$/i.test(suppliedId)
      ? suppliedId
      : crypto.randomUUID());
  const { __revision: _revision, ...storedPayload } = payload as Record<
    string,
    unknown
  >;
  const write = {
    payload: storedPayload,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
    revision: (previous?.revision ?? 0) + 1,
  };
  const result = previous
    ? await db
        .from("lms_records")
        .update(write)
        .eq("id", id!)
        .eq("office_id", officeId)
        .eq("revision", previous.revision)
        .select("id")
        .single()
    : await db
        .from("lms_records")
        .insert({
          ...write,
          id: recordId,
          kind,
          office_id: officeId,
          owner_id: user.id,
        })
        .select("id")
        .single();
  if (result.error)
    throw new Error(
      "The record could not be saved. Refresh and retry; it may have changed in another session.",
    );
  await invalidateRecordCache();
  return { ...payload, id: recordId, [recordRevision]: write.revision };
}
export async function deleteRecord(kind: Kind, id: string) {
  const { user, officeId } = await getContext();
  if (!mayWrite(kind, user.role) || !(await getRecord(kind, id)))
    throw new Error("Record not found or access denied.");
  await enforceRateLimit("write", user.id, 120, 60);
  const { error } = await createAdminClient()
    .from("lms_records")
    .delete()
    .eq("id", id)
    .eq("kind", kind)
    .eq("office_id", officeId);
  if (error) throw new Error("Unable to delete this record.");
  await invalidateRecordCache();
}
