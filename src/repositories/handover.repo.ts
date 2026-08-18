import type { DatabaseClient } from "@/db/client";
import { handoverLogs, type HandoverLog, type NewHandoverLog } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createHandoverRepository(database: DatabaseClient) {
  return {
    async create(input: NewHandoverLog): Promise<HandoverLog> {
      const rows = await database.insert(handoverLogs).values(input).returning();
      return requireInsertedRow(rows, "Handover log");
    },
  };
}

export type HandoverRepository = ReturnType<typeof createHandoverRepository>;
