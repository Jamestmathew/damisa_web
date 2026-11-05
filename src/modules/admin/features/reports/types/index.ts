export interface ReportSummary {
  id: string;
  title: string;
  description: string;
  category: "academic" | "financial" | "attendance";
  generatedAt: string;
}
