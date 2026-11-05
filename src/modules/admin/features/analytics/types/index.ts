export interface AnalyticsMetric {
  label: string;
  value: string;
  hint: string;
}

export interface AnalyticsTrendPoint {
  label: string;
  value: number;
}

export interface AnalyticsOverview {
  metrics: AnalyticsMetric[];
  enrollmentByDepartment: AnalyticsTrendPoint[];
  weeklyActiveUsers: AnalyticsTrendPoint[];
}
