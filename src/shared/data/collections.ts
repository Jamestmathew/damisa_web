import "server-only";
import { listRecords, saveRecord, deleteRecord, type Kind } from "./records";
export { listRecords };
// Persist each entity independently, rather than overwriting an office-wide JSON array.
export async function commitCollection<T extends { id: string }>(
  kind: Kind,
  before: T[],
  after: T[],
) {
  for (const row of before)
    if (!after.some((r) => r.id === row.id)) await deleteRecord(kind, row.id);
  for (const row of after) {
    const previous = before.find((r) => r.id === row.id);
    if (JSON.stringify(previous) !== JSON.stringify(row))
      await saveRecord(kind, row, previous ? row.id : undefined);
  }
}
