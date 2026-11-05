import { listRecords, commitCollection } from "@/shared/data/collections";
import "server-only";

import type { Department } from "../types";

function generateId() {
  return crypto.randomUUID();
}

export async function getDepartments(): Promise<Department[]> {
  const departments: Department[] = await listRecords<Department>("department");

  return [...departments];
}

export async function createDepartment(input: {
  name: string;
  code: string;
  headOfDepartment: string;
}): Promise<
  { ok: true; department: Department } | { ok: false; error: string }
> {
  const departments: Department[] = await listRecords<Department>("department");
  const before = structuredClone(departments);
  const result = await (async (): Promise<
    { ok: true; department: Department } | { ok: false; error: string }
  > => {
    if (
      departments.some((d) => d.code.toLowerCase() === input.code.toLowerCase())
    ) {
      return {
        ok: false,
        error: "A department with this code already exists.",
      };
    }

    const department: Department = {
      id: generateId(),
      name: input.name,
      code: input.code.toUpperCase(),
      headOfDepartment: input.headOfDepartment,
      courseCount: 0,
      teacherCount: 0,
    };
    departments.push(department);

    return { ok: true, department };
  })();
  if (result.ok) await commitCollection("department", before, departments);
  return result;
}

export async function updateDepartment(
  id: string,
  input: { name: string; code: string; headOfDepartment: string },
): Promise<
  { ok: true; department: Department } | { ok: false; error: string }
> {
  const departments: Department[] = await listRecords<Department>("department");
  const before = structuredClone(departments);
  const result = await (async (): Promise<
    { ok: true; department: Department } | { ok: false; error: string }
  > => {
    const department = departments.find((d) => d.id === id);

    if (!department) return { ok: false, error: "Department not found." };

    department.name = input.name;
    department.code = input.code.toUpperCase();
    department.headOfDepartment = input.headOfDepartment;

    return { ok: true, department };
  })();
  if (result.ok) await commitCollection("department", before, departments);
  return result;
}

export async function deleteDepartment(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const departments: Department[] = await listRecords<Department>("department");
  const before = structuredClone(departments);
  const result = await (async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    const index = departments.findIndex((d) => d.id === id);

    if (index === -1) return { ok: false, error: "Department not found." };

    departments.splice(index, 1);
    return { ok: true };
  })();
  if (result.ok) await commitCollection("department", before, departments);
  return result;
}
