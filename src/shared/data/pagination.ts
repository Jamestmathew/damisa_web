import "server-only";
interface PageQuery<T> {
  range(
    from: number,
    to: number,
  ): PromiseLike<{ data: T[] | null; error: unknown }>;
}
export async function collectRows<T>(query: PageQuery<T>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await query.range(from, from + 499);
    if (error) throw new Error("Unable to load database records.");
    rows.push(...(data ?? []));
    if (!data || data.length < 500) return rows;
  }
}
