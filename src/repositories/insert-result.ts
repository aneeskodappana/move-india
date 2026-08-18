export function requireInsertedRow<T>(rows: readonly T[], entityName: string): T {
  const row = rows[0];
  if (!row) {
    throw new Error(`${entityName} insert returned no row.`);
  }
  return row;
}
