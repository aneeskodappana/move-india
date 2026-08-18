import type { DatabaseClient } from "@/db/client";
import { grievances, type Grievance, type NewGrievance } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createGrievanceRepository(database: DatabaseClient) {
  return {
    async create(input: NewGrievance): Promise<Grievance> {
      const rows = await database.insert(grievances).values(input).returning();
      return requireInsertedRow(rows, "Grievance");
    },
  };
}

export type GrievanceRepository = ReturnType<typeof createGrievanceRepository>;
