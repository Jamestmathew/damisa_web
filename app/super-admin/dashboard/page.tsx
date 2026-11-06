import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/modules/auth/lib/route-guard";
import {
  getSuperAdminDashboardData,
  SuperAdminStatsGrid,
} from "@/modules/super-admin/features/dashboard";
import {
  getOffices,
  OfficesOverviewTable,
} from "@/modules/super-admin/features/offices";
import { getFinanceReports } from "@/modules/super-admin/features/finance/service";
import { TrendChart } from "@/shared/charts/trend-chart";
import { DonutChart } from "@/shared/charts/donut-chart";
import { recentMonths, monthOf } from "@/shared/charts/monthly";
export const metadata: Metadata = { title: "Network overview" };
export default async function Page() {
  const user = await requireAuth();
  const [data, offices, reports] = await Promise.all([
    getSuperAdminDashboardData(user.name),
    getOffices(),
    getFinanceReports(),
  ]);
  const students = offices.reduce((n, o) => n + o.totalStudents, 0),
    staff = offices.reduce((n, o) => n + (o.totalStaff ?? 0), 0),
    interns = offices.reduce((n, o) => n + (o.totalInterns ?? 0), 0);
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-[hsl(var(--brand-navy))] p-6 text-white sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-16 size-64 rounded-full border-[32px] border-[hsl(var(--brand-orange))]/20"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--brand-orange))]">
            School of Management and Innovation
          </p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Your training network, in one place
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/75">
            Welcome, {data.founderFirstName}. See students, your workforce and
            company income across states without being on-site.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-[hsl(var(--brand-orange))] text-[hsl(var(--brand-navy))] hover:bg-orange-300"
            >
              <Link href="/super-admin/admins">Manage Admins</Link>
            </Button>
            <Link
              href="/super-admin/finance"
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Finance reports
            </Link>
            <Link
              href="/super-admin/staff"
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Staff & Interns
            </Link>
          </div>
        </div>
      </section>
      <SuperAdminStatsGrid stats={data.stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart
          title="Network income trend"
          description="Confirmed income reported by Admins, last six months"
          format="naira"
          points={recentMonths().map((m) => ({
            label: m.label,
            value: reports
              .filter(
                (r) =>
                  r.status === "paid" &&
                  monthOf(r.earnedOn ?? r.recordedAt) === m.key,
              )
              .reduce((n, r) => n + r.amountNaira, 0),
          }))}
        />
        <DonutChart
          title="People across the network"
          description="Interns shown separately from the rest of your staff"
          points={[
            { label: "Students", value: students },
            { label: "Staff & Admins", value: staff - interns },
            { label: "Intern staff", value: interns },
          ]}
        />
      </div>
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Companies / Branches</h2>
            <p className="text-sm text-muted-foreground">
              Responsible Admin, state, people and confirmed income per company
            </p>
          </div>
          <Link
            className="text-sm font-medium text-primary underline"
            href="/super-admin/offices"
          >
            View company overview
          </Link>
        </div>
        <OfficesOverviewTable offices={offices} />
      </section>
    </div>
  );
}
