/**
 * "Office" = an institution/campus/branch overseen by one Admin. This is
 * Super Admin's own concept — it doesn't reach into Admin's Users/Finance
 * stores directly (keeping modules self-contained); the numbers here are
 * Super Admin's own mock aggregation until a real backend supplies them.
 */
export interface Office {
  id: string;
  name: string;
  adminId: string | null;
  adminName: string | null;
  totalStudents: number;
  totalRevenueNaira: number;
}
