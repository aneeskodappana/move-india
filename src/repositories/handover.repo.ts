import { and, asc, desc, eq, isNull } from "drizzle-orm";
import type { DatabaseClient } from "@/db/client";
import { withDatabaseRetry } from "@/db/retry";
import {
  collectionEvents,
  handoverLogs,
  occupants,
  properties,
  routes,
  type HandoverLog,
  type NewHandoverLog,
} from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export type PendingCollectorHandover = {
  id: string;
  residentName: string;
  addressLine: string;
  ward: string;
  routeName: string;
  materialType: string;
  timeWindow: string;
  residentMarkedAt: Date;
  photoUrl: string | null;
};

export function createHandoverRepository(database: DatabaseClient) {
  return {
    async create(input: NewHandoverLog): Promise<HandoverLog> {
      const rows = await database.insert(handoverLogs).values(input).returning();
      return requireInsertedRow(rows, "Handover log");
    },
    async findById(id: string): Promise<HandoverLog | null> {
      const rows = await withDatabaseRetry("Handover id lookup", () =>
        database.select().from(handoverLogs).where(eq(handoverLogs.id, id)).limit(1),
      );
      return rows[0] ?? null;
    },
    async findByOccupantAndEvent(
      occupantId: string,
      collectionEventId: string,
    ): Promise<HandoverLog | null> {
      const rows = await withDatabaseRetry("Resident handover lookup", () =>
        database
          .select()
          .from(handoverLogs)
          .where(
            and(
              eq(handoverLogs.occupantId, occupantId),
              eq(handoverLogs.collectionEventId, collectionEventId),
            ),
          )
          .limit(1),
      );
      return rows[0] ?? null;
    },
    async confirmCollected(id: string, collectorMarkedAt: Date): Promise<HandoverLog> {
      const rows = await database
        .update(handoverLogs)
        .set({ collectorMarkedAt, status: "collected" })
        .where(eq(handoverLogs.id, id))
        .returning();
      return requireInsertedRow(rows, "Handover log");
    },
    async listByOccupant(occupantId: string): Promise<HandoverLog[]> {
      return withDatabaseRetry("Handover occupant lookup", () =>
        database
          .select()
          .from(handoverLogs)
          .where(eq(handoverLogs.occupantId, occupantId))
          .orderBy(desc(handoverLogs.residentMarkedAt)),
      );
    },
    async listPendingByDate(eventDate: string): Promise<PendingCollectorHandover[]> {
      return withDatabaseRetry("Pending handover lookup", () =>
        database
          .select({
            id: handoverLogs.id,
            residentName: occupants.name,
            addressLine: properties.addressLine,
            ward: properties.ward,
            routeName: routes.name,
            materialType: collectionEvents.materialType,
            timeWindow: collectionEvents.timeWindow,
            residentMarkedAt: handoverLogs.residentMarkedAt,
            photoUrl: handoverLogs.photoUrl,
          })
          .from(handoverLogs)
          .innerJoin(collectionEvents, eq(handoverLogs.collectionEventId, collectionEvents.id))
          .innerJoin(occupants, eq(handoverLogs.occupantId, occupants.id))
          .innerJoin(properties, eq(collectionEvents.propertyId, properties.id))
          .innerJoin(routes, eq(collectionEvents.routeId, routes.id))
          .where(
            and(
              eq(collectionEvents.eventDate, eventDate),
              eq(handoverLogs.status, "kept_out"),
              isNull(handoverLogs.collectorMarkedAt),
            ),
          )
          .orderBy(asc(handoverLogs.residentMarkedAt)),
      );
    },
  };
}

export type HandoverRepository = ReturnType<typeof createHandoverRepository>;
