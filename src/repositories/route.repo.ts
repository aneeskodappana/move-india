import { eq } from "drizzle-orm";
import type { DatabaseClient } from "@/db/client";
import { withDatabaseRetry } from "@/db/retry";
import { routes, type NewRoute, type Route } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createRouteRepository(database: DatabaseClient) {
  return {
    async create(input: NewRoute): Promise<Route> {
      const rows = await database.insert(routes).values(input).returning();
      return requireInsertedRow(rows, "Route");
    },
    async findById(id: string): Promise<Route | null> {
      const rows = await withDatabaseRetry("Route lookup", () =>
        database.select().from(routes).where(eq(routes.id, id)).limit(1),
      );
      return rows[0] ?? null;
    },
  };
}

export type RouteRepository = ReturnType<typeof createRouteRepository>;
