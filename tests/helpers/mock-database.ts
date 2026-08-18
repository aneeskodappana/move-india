import type { DatabaseClient } from "@/db/client";

export function createInsertHarness<T>(insertedRow: T) {
  const returning = vi.fn().mockResolvedValue([insertedRow]);
  const values = vi.fn().mockReturnValue({ returning });
  const insert = vi.fn().mockReturnValue({ values });

  return {
    database: { insert } as unknown as DatabaseClient,
    insert,
    values,
    returning,
  };
}
