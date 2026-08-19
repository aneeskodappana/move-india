import { asc, eq } from "drizzle-orm";
import type { DatabaseClient } from "@/db/client";
import { withDatabaseRetry } from "@/db/retry";
import { occupants, properties, type NewProperty, type Property } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createPropertyRepository(database: DatabaseClient) {
  return {
    async create(input: NewProperty): Promise<Property> {
      const rows = await database.insert(properties).values(input).returning();
      return requireInsertedRow(rows, "Property");
    },
    async findById(id: string): Promise<Property | null> {
      const rows = await withDatabaseRetry("Property lookup", () =>
        database.select().from(properties).where(eq(properties.id, id)).limit(1),
      );
      return rows[0] ?? null;
    },
    async listWithOccupants(): Promise<PropertyJoinOption[]> {
      const rows = await withDatabaseRetry("Property join options", () =>
        database
          .select({
            property: properties,
            occupant: {
              id: occupants.id,
              name: occupants.name,
              role: occupants.role,
            },
          })
          .from(properties)
          .leftJoin(occupants, eq(occupants.propertyId, properties.id))
          .orderBy(asc(properties.ward), asc(properties.addressLine), asc(occupants.name)),
      );

      const options = new Map<string, PropertyJoinOption>();
      for (const row of rows) {
        const option = options.get(row.property.id) ?? { ...row.property, occupants: [] };
        if (row.occupant) {
          option.occupants.push({
            id: row.occupant.id,
            name: row.occupant.name,
            role: row.occupant.role,
          });
        }
        options.set(row.property.id, option);
      }
      return [...options.values()];
    },
  };
}

export type PropertyJoinOption = Property & {
  occupants: Array<{
    id: string;
    name: string;
    role: "owner" | "tenant";
  }>;
};

export type PropertyRepository = ReturnType<typeof createPropertyRepository>;
