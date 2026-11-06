import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const state = {
  user: { id: "admin-a", role: "admin", officeId: "office-a" },
  records: [],
  people: [],
  offices: [
    { id: "office-a", name: "Campus A" },
    { id: "office-b", name: "Campus B" },
  ],
};
globalThis.__finance = state;
function query(table) {
  const filters = [];
  let write;
  let limit = Infinity;
  function rows() {
    return (
      table === "profiles"
        ? state.people
        : table === "offices"
          ? state.offices
          : state.records
    )
      .filter((r) => filters.every((f) => f(r)))
      .slice(0, limit);
  }
  const q = {
    select() {
      return q;
    },
    order() {
      return q;
    },
    eq(k, v) {
      filters.push((r) => r[k] === v);
      return q;
    },
    in(k, v) {
      filters.push((r) => v.includes(r[k]));
      return q;
    },
    ilike(k, v) {
      filters.push(
        (r) =>
          (k === "payload->>reference"
            ? r.payload.reference
            : r[k]
          )?.toLowerCase() === v.replaceAll("\\", "").toLowerCase(),
      );
      return q;
    },
    limit(n) {
      limit = n;
      return q;
    },
    insert(v) {
      write = v;
      return q;
    },
    async single() {
      return {
        data: rows()[0],
        error: rows()[0] ? null : { message: "not found" },
      };
    },
    async maybeSingle() {
      return { data: rows()[0] ?? null, error: null };
    },
    then(resolve, reject) {
      if (write) {
        if (state.records.some((r) => r.id === write.id))
          return Promise.resolve({ error: { code: "23505" } }).then(
            resolve,
            reject,
          );
        state.records.push(structuredClone(write));
        return Promise.resolve({ error: null }).then(resolve, reject);
      }
      return Promise.resolve({ data: rows(), error: null }).then(
        resolve,
        reject,
      );
    },
  };
  return q;
}
state.db = { from: query };
const mocks = {
  "server-only": "",
  "@/shared/rbac":
    "export async function requireRole(roles){const user=globalThis.__finance.user;if(!roles.includes(user.role))throw new Error('Access denied');return user}",
  "@/modules/auth/lib/route-guard":
    "export async function getOptionalSession(){return globalThis.__finance.user}",
  "@/supabase/admin":
    "export function createAdminClient(){return globalThis.__finance.db}",
  "@/shared/data/pagination":
    "export async function collectRows(q){const r=await q;if(r.error)throw r.error;return r.data}",
  "@/shared/security/rate-limit": "export async function enforceRateLimit(){}",
  "@/shared/data/records":
    'export async function getRecord(){return null} export async function saveRecord(){throw new Error("Unexpected receipt update")}',
  "@/shared/data/people": "export async function getOfficePeople(){return []}",
  "@/modules/admin/features/settings/services/settings.service":
    "export async function getSystemSettings(){return {allowManualPaymentRecording:true}}",
};
registerHooks({
  resolve(spec, ctx, next) {
    if (spec in mocks) return { url: "finance:" + spec, shortCircuit: true };
    if (spec.startsWith("@/")) {
      const url = new URL("../src/" + spec.slice(2) + ".ts", import.meta.url);
      if (existsSync(url)) return { url: url.href, shortCircuit: true };
    }
    if (
      spec.startsWith(".") &&
      ctx.parentURL?.endsWith(".ts") &&
      !spec.endsWith(".ts")
    ) {
      const url = new URL(spec + ".ts", ctx.parentURL);
      if (existsSync(url)) return { url: url.href, shortCircuit: true };
    }
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url.startsWith("finance:"))
      return {
        format: "module",
        source: mocks[url.slice(8)],
        shortCircuit: true,
      };
    if (url.endsWith(".ts"))
      return {
        format: "module",
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
        shortCircuit: true,
      };
    return next(url, ctx);
  },
});
const service = await import("../src/shared/finance/service.ts");
const model = await import("../src/shared/finance/model.ts");
const adminService = await import(
  "../src/modules/admin/features/finance/services/finance.service.ts"
);
const exporter = await import("../app/api/finance/export/route.ts");
function reset() {
  state.user = { id: "admin-a", role: "admin", officeId: "office-a" };
  state.people = [
    { id: "admin-a", name: "Admin A", role: "admin", office_id: "office-a" },
    { id: "super", name: "HQ", role: "super_admin", office_id: null },
    {
      id: "student-a",
      name: "Student A",
      role: "student",
      office_id: "office-a",
      matric_number: "SMI/001",
    },
    {
      id: "student-b",
      name: "Student B",
      role: "student",
      office_id: "office-b",
    },
  ];
  state.records = [
    {
      id: "fee-a",
      kind: "student_fee",
      office_id: "office-a",
      owner_id: "admin-a",
      payload: { studentId: "student-a", totalDueNaira: 100 },
    },
    {
      id: "admin-receipt",
      kind: "payment",
      office_id: "office-a",
      owner_id: "admin-a",
      payload: {
        studentId: "student-a",
        payerName: "Student A",
        purpose: "Fees",
        amountNaira: 30,
        status: "paid",
        reference: "ADMIN-1",
        earnedOn: "2026-11-01",
        recordedAt: "2026-11-01T12:00:00Z",
      },
    },
    {
      id: "other-office",
      kind: "payment",
      office_id: "office-b",
      owner_id: "admin-b",
      payload: {
        studentId: "student-b",
        amountNaira: 200,
        status: "paid",
        reference: "B-1",
        earnedOn: "2026-11-01",
        recordedAt: "2026-11-01T12:00:00Z",
      },
    },
  ];
}
test("Admin and Super Admin see the same student balance after a direct HQ payment", async () => {
  reset();
  state.user = { id: "super", role: "super_admin", officeId: null };
  await service.recordDirectStudentReceipt({
    studentId: "student-a",
    amountNaira: 25,
    reference: "HQ-1",
    earnedOn: "2026-11-02",
    purpose: "Fees",
  });
  const national = await service.getFinancialLedger();
  state.user = { id: "admin-a", role: "admin", officeId: "office-a" };
  const local = await service.getFinancialLedger();
  assert.equal(local.students[0].paidNaira, 55);
  assert.equal(local.students[0].remainingNaira, 45);
  assert.equal(
    national.students.find((s) => s.id === "student-a").remainingNaira,
    45,
  );
  assert.equal(
    local.payments.find((p) => p.reference === "HQ-1").recordedByRole,
    "super_admin",
  );
  assert.equal(
    local.payments.some((p) => p.officeId === "office-b"),
    false,
  );
});
test("Super Admin cannot overwrite Admin receipts, and receipt retries cannot duplicate money", async () => {
  reset();
  state.user = { id: "super", role: "super_admin", officeId: null };
  const before = structuredClone(state.records[1]);
  await assert.rejects(
    adminService.recordManualPayment({ id: "admin-receipt" }),
    /Access denied/,
  );
  await assert.rejects(
    service.recordDirectStudentReceipt({
      studentId: "student-a",
      amountNaira: 25,
      reference: "ADMIN-1",
      earnedOn: "2026-11-02",
      purpose: "Fees",
    }),
    /already recorded/,
  );
  assert.deepEqual(state.records[1], before);
  const input = {
    studentId: "student-a",
    amountNaira: 25,
    reference: "HQ-1",
    earnedOn: "2026-11-02",
    purpose: "Fees",
  };
  await service.recordDirectStudentReceipt(input);
  await service.recordDirectStudentReceipt(input);
  assert.equal(
    state.records.filter((r) => r.payload.reference === "HQ-1").length,
    1,
  );
  await assert.rejects(
    service.recordDirectStudentReceipt({ ...input, amountNaira: 999 }),
    /already recorded/,
  );
});
test("Admin expenses are office-scoped and read-only to Super Admin", async () => {
  reset();
  await service.recordOfficeExpense({
    description: "Supplies",
    amountNaira: 15,
    spentOn: "2026-11-02",
    reference: "EXP-1",
  });
  const ledger = await service.getFinancialLedger();
  assert.equal(ledger.expenses[0].officeId, "office-a");
  assert.equal(ledger.expenses[0].amountNaira, 15);
  state.user = { id: "super", role: "super_admin", officeId: null };
  assert.equal(
    (await service.getFinancialLedger()).expenses[0].amountNaira,
    15,
  );
  await assert.rejects(service.recordOfficeExpense({}), /Access denied/);
});
test("unconfigured fees and overpayments remain explicit rather than hiding money", () => {
  assert.deepEqual(
    model.ledgerStudentBalance(
      "s",
      [],
      [{ studentId: "s", amountNaira: 20, status: "paid" }],
    ),
    {
      totalDueNaira: null,
      paidNaira: 20,
      remainingNaira: null,
      creditNaira: 0,
    },
  );
  assert.equal(
    model.ledgerStudentBalance(
      "s",
      [{ studentId: "s", totalDueNaira: 100 }],
      [{ studentId: "s", amountNaira: 120, status: "paid" }],
    ).creditNaira,
    20,
  );
  assert.equal(model.moneyTotal([0.1, 0.2]), 0.3);
});
test("financial exports enforce role and office scope and protect spreadsheet formulas", async () => {
  reset();
  state.people[2].name = '=HYPERLINK("bad")';
  const response = await exporter.GET(
    new Request(
      "https://app.test/api/finance/export?month=2026-11&office=office-b",
    ),
  );
  const csv = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-disposition"), /attachment/);
  assert.equal(csv.includes("B-1"), false);
  assert.equal(csv.includes("'=HYPERLINK"), true);
  state.user = { role: "tutor" };
  assert.equal(
    (
      await exporter.GET(
        new Request("https://app.test/api/finance/export?month=2026-11"),
      )
    ).status,
    403,
  );
  assert.equal(model.validFinanceMonth("2026-13"), false);
});

test("deleting an Admin account does not change who received historic money", async () => {
  reset();
  state.records[1].owner_id = "super";
  state.records[1].payload.originalRecorder = {
    id: "old-admin",
    name: "Former Admin",
    role: "admin",
  };
  const ledger = await service.getFinancialLedger();
  assert.equal(ledger.payments[0].recordedByRole, "admin");
  assert.equal(ledger.payments[0].recordedByName, "Former Admin");
});
