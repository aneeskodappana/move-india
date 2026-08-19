import { and, desc, eq } from "drizzle-orm";
import type { DatabaseClient } from "@/db/client";
import { withDatabaseRetry } from "@/db/retry";
import {
  collectionEvents,
  type CollectionEvent,
  type NewCollectionEvent,
} from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createCollectionEventRepository(database: DatabaseClient) {
  return {
    async create(input: NewCollectionEvent): Promise<CollectionEvent> {
      const rows = await database.insert(collectionEvents).values(input).returning();
      return requireInsertedRow(rows, "Collection event");
    },
    async findByPropertyAndDate(propertyId: string, eventDate: string): Promise<CollectionEvent | null> {
      const rows = await withDatabaseRetry("Collection-event lookup", () =>
        database
          .select()
          .from(collectionEvents)
          .where(
            and(
              eq(collectionEvents.propertyId, propertyId),
              eq(collectionEvents.eventDate, eventDate),
            ),
          )
          .limit(1),
      );
      return rows[0] ?? null;
    },
    async findById(id: string): Promise<CollectionEvent | null> {
      const rows = await withDatabaseRetry("Collection-event id lookup", () =>
        database.select().from(collectionEvents).where(eq(collectionEvents.id, id)).limit(1),
      );
      return rows[0] ?? null;
    },
    async listByProperty(propertyId: string): Promise<CollectionEvent[]> {
      return withDatabaseRetry("Collection-event property lookup", () =>
        database
          .select()
          .from(collectionEvents)
          .where(eq(collectionEvents.propertyId, propertyId))
          .orderBy(desc(collectionEvents.eventDate)),
      );
    },
  };
}

export type CollectionEventRepository = ReturnType<typeof createCollectionEventRepository>;
