import type { DatabaseClient } from "@/db/client";
import { occupants, type NewOccupant, type Occupant } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createOccupantRepository(database: DatabaseClient) {
  return {
    async create(input: NewOccupant): Promise<Occupant> {
      const rows = await database.insert(occupants).values(input).returning();
      return requireInsertedRow(rows, "Occupant");
    },
  };
}

export type OccupantRepository = ReturnType<typeof createOccupantRepository>;
