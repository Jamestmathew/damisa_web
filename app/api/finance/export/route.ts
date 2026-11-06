import { monthOf } from "@/shared/charts/monthly";
import { getOptionalSession } from "@/modules/auth/lib/route-guard";
import { getFinancialLedger } from "@/shared/finance/service";
import { csvCell, moneyTotal, validFinanceMonth } from "@/shared/finance/model";
import { enforceRateLimit } from "@/shared/security/rate-limit";
export async function GET(request: Request) {
  const user = await getOptionalSession();
  if (!user) return new Response("Sign in required", { status: 401 });
  if (!["admin", "super_admin"].includes(user.role))
    return new Response("Access denied", { status: 403 });
  const month = new URL(request.url).searchParams.get("month") ?? "";
  if (!validFinanceMonth(month))
    return new Response("Choose a valid month", { status: 400 });
  try {
    await enforceRateLimit("finance-export", user.id, 10, 60);
  } catch {
    return new Response("Too many downloads. Retry shortly.", { status: 429 });
  }
  const ledger = await getFinancialLedger();
  const income = ledger.payments.filter(
      (p) =>
        p.status === "paid" && monthOf(p.earnedOn ?? p.recordedAt) === month,
    ),
    expenses = ledger.expenses.filter((e) => e.spentOn.slice(0, 7) === month);
  const received = moneyTotal(income.map((p) => p.amountNaira)),
    spent = moneyTotal(expenses.map((e) => e.amountNaira));
  const rows: (string | number | null)[][] = [
    ["SMI monthly financial report", month],
    ["Money received (NGN)", received],
    ["Expenses (NGN)", spent],
    ["Money left this month (NGN)", moneyTotal([received, -spent])],
    ["Excludes opening balances; current student balances follow below."],
    [],
    [
      "Date",
      "Company",
      "Type",
      "Student / payer",
      "Purpose / description",
      "Income (NGN)",
      "Expense (NGN)",
      "Recorded by",
      "Collector role",
      "Reference",
    ],
  ];
  for (const p of income)
    rows.push([
      p.earnedOn ?? p.recordedAt.slice(0, 10),
      p.officeName,
      p.studentId ? "Student payment" : "Other income",
      p.payerName,
      p.purpose,
      p.amountNaira,
      0,
      p.recordedByName,
      p.recordedByRole,
      p.reference,
    ]);
  for (const e of expenses)
    rows.push([
      e.spentOn,
      e.officeName,
      "Expense",
      "",
      e.description,
      0,
      e.amountNaira,
      e.recordedByName,
      e.recordedByRole,
      e.reference,
    ]);
  rows.push(
    [],
    ["Current student balances (all payments, current fee totals)"],
    [
      "Company",
      "Student",
      "Matric number",
      "Total fees (NGN)",
      "Paid (NGN)",
      "Remaining (NGN)",
      "Credit (NGN)",
    ],
  );
  for (const s of ledger.students)
    rows.push([
      s.officeName,
      s.name,
      s.matricNumber,
      s.totalDueNaira ?? "Fees not set",
      s.paidNaira,
      s.remainingNaira ?? "Fees not set",
      s.creditNaira,
    ]);
  return new Response(
    "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="smi-finance-${month}.csv"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
