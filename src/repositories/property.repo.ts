import type { DatabaseClient } from "@/db/client";
import { properties, type NewProperty, type Property } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createPropertyRepository(database: DatabaseClient) {
  return {
    async create(input: NewProperty): Promise<Property> {
      const rows = await database.insert(properties).values(input).returning();
      return requireInsertedRow(rows, "Property");
    },
  };
}

export type PropertyRepository = ReturnType<typeof createPropertyRepository>;
