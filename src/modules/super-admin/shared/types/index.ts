export interface Office {
  id: string;
  name: string;
  adminId: string | null;
  adminName: string | null;
  totalStudents: number;
  totalStaff?: number;
  totalInterns?: number;
  state?: string;
  totalRevenueNaira: number;
}
