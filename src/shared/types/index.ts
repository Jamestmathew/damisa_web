/**
 * Global "Shared UI/infra" types — reused across every business module.
 */

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export type AsyncResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type SortDirection = "asc" | "desc";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}
