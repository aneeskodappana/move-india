import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export function createDatabaseClient(databaseUrl: string) {
  if (!databaseUrl.startsWith("postgresql://")) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
  }

  return drizzle(neon(databaseUrl));
}

export function getDatabaseClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return createDatabaseClient(databaseUrl);
}
