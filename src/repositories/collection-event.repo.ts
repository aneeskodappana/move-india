import type { DatabaseClient } from "@/db/client";
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
  };
}

export type CollectionEventRepository = ReturnType<typeof createCollectionEventRepository>;
