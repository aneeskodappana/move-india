import type { DatabaseClient } from "@/db/client";
import { routes, type NewRoute, type Route } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createRouteRepository(database: DatabaseClient) {
  return {
    async create(input: NewRoute): Promise<Route> {
      const rows = await database.insert(routes).values(input).returning();
      return requireInsertedRow(rows, "Route");
    },
  };
}

export type RouteRepository = ReturnType<typeof createRouteRepository>;
