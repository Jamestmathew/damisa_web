import { listRecords, commitCollection } from "@/shared/data/collections";
import "server-only";

import type { AdminClass } from "../types";

function generateId() {
  return crypto.randomUUID();
}

export async function getClasses(): Promise<AdminClass[]> {
  const classes: AdminClass[] = await listRecords<AdminClass>("class");

  return [...classes];
}

export async function createClass(input: {
  name: string;
  department: string;
  teacher: string;
  schedule: string;
}): Promise<{ ok: true; class: AdminClass } | { ok: false; error: string }> {
  const classes: AdminClass[] = await listRecords<AdminClass>("class");
  const before = structuredClone(classes);
  const result = await (async (): Promise<
    { ok: true; class: AdminClass } | { ok: false; error: string }
  > => {
    const newClass: AdminClass = {
      id: generateId(),
      name: input.name,
      department: input.department,
      teacher: input.teacher,
      schedule: input.schedule,
      studentCount: 0,
    };
    classes.push(newClass);

    return { ok: true, class: newClass };
  })();
  if (result.ok) await commitCollection("class", before, classes);
  return result;
}

export async function updateClass(
  id: string,
  input: {
    name: string;
    department: string;
    teacher: string;
    schedule: string;
  },
): Promise<{ ok: true; class: AdminClass } | { ok: false; error: string }> {
  const classes: AdminClass[] = await listRecords<AdminClass>("class");
  const before = structuredClone(classes);
  const result = await (async (): Promise<
    { ok: true; class: AdminClass } | { ok: false; error: string }
  > => {
    const found = classes.find((c) => c.id === id);

    if (!found) return { ok: false, error: "Class not found." };

    found.name = input.name;
    found.department = input.department;
    found.teacher = input.teacher;
    found.schedule = input.schedule;

    return { ok: true, class: found };
  })();
  if (result.ok) await commitCollection("class", before, classes);
  return result;
}

export async function deleteClass(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const classes: AdminClass[] = await listRecords<AdminClass>("class");
  const before = structuredClone(classes);
  const result = await (async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    const index = classes.findIndex((c) => c.id === id);

    if (index === -1) return { ok: false, error: "Class not found." };

    classes.splice(index, 1);
    return { ok: true };
  })();
  if (result.ok) await commitCollection("class", before, classes);
  return result;
}
