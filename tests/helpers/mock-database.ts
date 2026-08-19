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

export function createSelectOneHarness<T>(rows: T[]) {
  const limit = vi.fn().mockResolvedValue(rows);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });

  return {
    database: { select } as unknown as DatabaseClient,
    select,
    from,
    where,
    limit,
  };
}

export function createSelectListHarness<T>(rows: T[]) {
  const orderBy = vi.fn().mockResolvedValue(rows);
  const where = vi.fn().mockReturnValue({ orderBy });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });

  return {
    database: { select } as unknown as DatabaseClient,
    select,
    from,
    where,
    orderBy,
  };
}
