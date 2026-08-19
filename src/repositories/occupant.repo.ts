import { eq } from "drizzle-orm";
import type { DatabaseClient } from "@/db/client";
import { withDatabaseRetry } from "@/db/retry";
import { occupants, type NewOccupant, type Occupant } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createOccupantRepository(database: DatabaseClient) {
  return {
    async create(input: NewOccupant): Promise<Occupant> {
      const rows = await database.insert(occupants).values(input).returning();
      return requireInsertedRow(rows, "Occupant");
    },
    async findByPhone(phone: string): Promise<Occupant | null> {
      const rows = await withDatabaseRetry("Occupant lookup", () =>
        database.select().from(occupants).where(eq(occupants.phone, phone)).limit(1),
      );
      return rows[0] ?? null;
    },
  };
}

export type OccupantRepository = ReturnType<typeof createOccupantRepository>;
