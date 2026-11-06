import { moneyTotal, validFinanceMonth } from "./model";
import type { getFinancialLedger } from "./service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendChart } from "@/shared/charts/trend-chart";
import { monthOf, recentMonths } from "@/shared/charts/monthly";
type Ledger = Awaited<ReturnType<typeof getFinancialLedger>>;
export function FinanceLedgerReport({
  ledger,
  month,
}: {
  ledger: Ledger;
  month: string;
}) {
  const selected = validFinanceMonth(month)
    ? month
    : recentMonths().at(-1)!.key;
  const income = ledger.payments.filter(
      (p) =>
        p.status === "paid" && monthOf(p.earnedOn ?? p.recordedAt) === selected,
    ),
    expenses = ledger.expenses.filter(
      (e) => e.spentOn.slice(0, 7) === selected,
    );
  const received = moneyTotal(income.map((p) => p.amountNaira)),
    spent = moneyTotal(expenses.map((e) => e.amountNaira));
  const studentPayments = ledger.payments.filter(
    (p) => p.studentId && p.status === "paid",
  );
  const money = (n: number | null) =>
    n === null
      ? "Fees not set"
      : `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const transactions = [
    ...income.map((p) => ({
      id: p.id,
      date: p.earnedOn ?? p.recordedAt.slice(0, 10),
      type: p.studentId ? "Student payment" : "Other income",
      description: p.purpose,
      amount: p.amountNaira,
      actor: `${p.recordedByName} (${p.recordedByRole === "super_admin" ? "Super Admin" : p.recordedByRole})`,
      reference: p.reference,
      office: p.officeName,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      date: e.spentOn,
      type: "Expense",
      description: e.description,
      amount: -e.amountNaira,
      actor: e.recordedByName,
      reference: e.reference,
      office: e.officeName,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="space-y-6">
      <form className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Report month
          <input
            type="month"
            name="month"
            required
            defaultValue={selected}
            className="mt-1 block h-10 rounded-md border bg-background px-3"
          />
        </label>
        <Button>View month</Button>
        <Button asChild variant="outline">
          <a href={`/api/finance/export?month=${selected}`}>
            Download monthly report (CSV)
          </a>
        </Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Money received this month", value: received },
          { label: "Expenses this month", value: spent },
          {
            label: "Money left this month",
            value: moneyTotal([received, -spent]),
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-2xl font-semibold">{money(s.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Money left is this month’s recorded income minus expenses. It excludes
        opening balances and is not a bank reconciliation. Link each student
        payment once; do not enter the same money again as company income.
      </p>
      <TrendChart
        title="Monthly money received"
        description="Confirmed receipts recorded by Admin and Super Admin"
        format="naira"
        points={recentMonths().map((m) => ({
          label: m.label,
          value: moneyTotal(
            ledger.payments
              .filter(
                (p) =>
                  p.status === "paid" &&
                  monthOf(p.earnedOn ?? p.recordedAt) === m.key,
              )
              .map((p) => p.amountNaira),
          ),
        }))}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Student payments · all time",
            value: money(moneyTotal(studentPayments.map((p) => p.amountNaira))),
          },
          {
            label: "Outstanding student fees · current",
            value: money(
              moneyTotal(ledger.students.map((s) => s.remainingNaira ?? 0)),
            ),
          },
          {
            label: "Students with fees not set",
            value: String(
              ledger.students.filter((s) => s.totalDueNaira === null).length,
            ),
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold">Who recorded student payments?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {["admin", "super_admin", "unknown"].map((role) => (
            <p key={role} className="text-sm">
              <span className="block text-muted-foreground">
                {role === "super_admin"
                  ? "Super Admin"
                  : role === "admin"
                    ? "Admin"
                    : "Historical / other collector"}
              </span>
              <strong>
                {money(
                  moneyTotal(
                    studentPayments
                      .filter((p) =>
                        role === "unknown"
                          ? !["admin", "super_admin"].includes(p.recordedByRole)
                          : p.recordedByRole === role,
                      )
                      .map((p) => p.amountNaira),
                  ),
                )}
              </strong>
            </p>
          ))}
        </div>
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Student fees and balances</h2>
        <p className="text-xs text-muted-foreground">
          Current fees and all recorded payments, including payments received by
          Super Admin. Unset fees are not treated as zero.
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {[
                  "Company",
                  "Student",
                  "Matric number",
                  "Total fees",
                  "Paid",
                  "Remaining",
                  "Credit",
                ].map((h) => (
                  <th key={h} className="p-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledger.students.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">{s.officeName}</td>
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{s.matricNumber ?? "—"}</td>
                  <td className="p-3">{money(s.totalDueNaira)}</td>
                  <td className="p-3">{money(s.paidNaira)}</td>
                  <td className="p-3">{money(s.remainingNaira)}</td>
                  <td className="p-3">{money(s.creditNaira)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!ledger.students.length && (
            <p className="p-5 text-muted-foreground">
              No student accounts or balances to display.
            </p>
          )}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {selected} receipts and expenses
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {[
                  "Date",
                  "Company",
                  "Type",
                  "Description",
                  "Amount",
                  "Recorded by",
                  "Reference",
                ].map((h) => (
                  <th key={h} className="p-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">{t.office}</td>
                  <td className="p-3">{t.type}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3">{money(t.amount)}</td>
                  <td className="p-3">{t.actor}</td>
                  <td className="p-3">{t.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!transactions.length && (
            <p className="p-5 text-muted-foreground">
              No receipts or expenses recorded for this month.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
