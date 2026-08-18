import { config as loadEnvironment } from "dotenv";
import { and, count, eq, isNull, notLike } from "drizzle-orm";
import { getDatabaseClient } from "@/db/client";
import { withDatabaseRetry } from "@/db/retry";
import {
  collectionEvents,
  grievances,
  handoverLogs,
  occupants,
  payments,
  properties,
  routes,
} from "@/db/schema";

loadEnvironment({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes("demo-host.example")) {
    throw new Error("M1 verification requires the synthetic development DATABASE_URL.");
  }

  const database = getDatabaseClient();
  const [routeCount] = await withDatabaseRetry("Route count", () =>
    database.select({ value: count() }).from(routes),
  );
  const [propertyCount] = await withDatabaseRetry("Property count", () =>
    database.select({ value: count() }).from(properties),
  );
  const [occupantCount] = await withDatabaseRetry("Occupant count", () =>
    database.select({ value: count() }).from(occupants),
  );
  const [eventCount] = await withDatabaseRetry("Collection-event count", () =>
    database.select({ value: count() }).from(collectionEvents),
  );
  const [handoverCount] = await withDatabaseRetry("Handover count", () =>
    database.select({ value: count() }).from(handoverLogs),
  );
  const [paymentCount] = await withDatabaseRetry("Payment count", () =>
    database.select({ value: count() }).from(payments),
  );
  const [grievanceCount] = await withDatabaseRetry("Grievance count", () =>
    database.select({ value: count() }).from(grievances),
  );

  const observedCounts = {
    routes: routeCount?.value ?? 0,
    properties: propertyCount?.value ?? 0,
    occupants: occupantCount?.value ?? 0,
    collection_events: eventCount?.value ?? 0,
    handover_logs: handoverCount?.value ?? 0,
    payments: paymentCount?.value ?? 0,
    grievances: grievanceCount?.value ?? 0,
  };
  const minimums = {
    routes: 4,
    properties: 8,
    occupants: 12,
    collection_events: 60,
    handover_logs: 50,
    payments: 36,
    grievances: 1,
  };
  for (const [table, minimum] of Object.entries(minimums)) {
    const observed = observedCounts[table as keyof typeof observedCounts];
    if (observed < minimum) {
      throw new Error(`${table} has ${observed} rows; expected at least ${minimum}.`);
    }
  }

  const [proofGap] = await withDatabaseRetry("Proof-gap query", () =>
    database
      .select({ value: count() })
      .from(handoverLogs)
      .innerJoin(occupants, eq(occupants.id, handoverLogs.occupantId))
      .where(
        and(
          eq(occupants.name, "Anjali Nair"),
          eq(handoverLogs.status, "kept_out"),
          isNull(handoverLogs.collectorMarkedAt),
        ),
      ),
  );
  if (!proofGap || proofGap.value < 1) {
    throw new Error("The deliberate Anjali proof-gap record is missing.");
  }

  const [phoneSafety] = await withDatabaseRetry("Synthetic-phone query", () =>
    database
      .select({ value: count() })
      .from(occupants)
      .where(notLike(occupants.phone, "+91-00000-%")),
  );
  if (!phoneSafety || phoneSafety.value !== 0) {
    throw new Error("The development database contains a non-synthetic phone number.");
  }

  process.stdout.write(
    `Verified 7 tables, synthetic seed minimums, the proof-gap record, and phone safety.\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
