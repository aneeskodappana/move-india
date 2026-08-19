import { config as loadEnvironment } from "dotenv";
import { eq } from "drizzle-orm";
import { getDatabaseClient } from "@/db/client";
import {
  collectionEvents,
  grievances,
  handoverLogs,
  occupants,
  payments,
  properties,
  routes,
} from "@/db/schema";
import { buildSeedData } from "@/db/seed-data";
import { withDatabaseRetry } from "@/db/retry";
import {
  createCollectionEventInputSchema,
  createGrievanceInputSchema,
  createHandoverLogInputSchema,
  createOccupantInputSchema,
  createPaymentInputSchema,
  createPropertyInputSchema,
  createRouteInputSchema,
} from "@/schemas";

loadEnvironment({ path: [".env.local", ".env"], quiet: true });

async function main() {
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || databaseUrl.includes("demo-host.example")) {
  throw new Error("Configure DATABASE_URL for a synthetic development database before seeding.");
}

const data = buildSeedData();
data.routes.forEach((value) => createRouteInputSchema.parse(value));
data.properties.forEach((value) => createPropertyInputSchema.parse(value));
data.occupants.forEach((value) => createOccupantInputSchema.parse(value));
data.collectionEvents.forEach((value) => createCollectionEventInputSchema.parse(value));
data.handoverLogs.forEach((value) => createHandoverLogInputSchema.parse(value));
data.payments.forEach((value) => createPaymentInputSchema.parse(value));
data.grievances.forEach((value) => createGrievanceInputSchema.parse(value));

const database = getDatabaseClient();
await withDatabaseRetry("Route seed", () =>
  database.insert(routes).values(data.routes).onConflictDoNothing(),
);
await withDatabaseRetry("Property seed", () =>
  database.insert(properties).values(data.properties).onConflictDoNothing(),
);
await withDatabaseRetry("Occupant seed", () =>
  database.insert(occupants).values(data.occupants).onConflictDoNothing(),
);
await withDatabaseRetry("Collection-event seed", () =>
  database.insert(collectionEvents).values(data.collectionEvents).onConflictDoNothing(),
);
await withDatabaseRetry("Handover seed", () =>
  database.insert(handoverLogs).values(data.handoverLogs).onConflictDoNothing(),
);
await withDatabaseRetry("Payment seed", () =>
  database.insert(payments).values(data.payments).onConflictDoNothing(),
);
await withDatabaseRetry("Grievance seed", () =>
  database.insert(grievances).values(data.grievances).onConflictDoNothing(),
);

for (const route of data.routes) {
  await withDatabaseRetry(`Route label ${route.name}`, () =>
    database.update(routes).set({ name: route.name, ward: route.ward }).where(eq(routes.id, route.id)),
  );
}

for (const property of data.properties) {
  await withDatabaseRetry(`Property label ${property.addressLine}`, () =>
    database
      .update(properties)
      .set({ addressLine: property.addressLine, ward: property.ward })
      .where(eq(properties.id, property.id)),
  );
}

process.stdout.write(
  `Seeded ${data.routes.length} routes, ${data.properties.length} properties, ${data.occupants.length} occupants, ${data.collectionEvents.length} collection events, ${data.handoverLogs.length} handover logs, ${data.payments.length} payments, and ${data.grievances.length} grievance.\n`,
);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
