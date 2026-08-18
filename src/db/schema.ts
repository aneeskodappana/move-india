import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const occupantRoleEnum = pgEnum("occupant_role", ["owner", "tenant"]);
export const collectionStatusEnum = pgEnum("collection_status", [
  "scheduled",
  "in_progress",
  "completed",
]);
export const handoverStatusEnum = pgEnum("handover_status", [
  "kept_out",
  "collected",
  "missed",
  "disputed",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["paid", "pending"]);
export const grievanceStatusEnum = pgEnum("grievance_status", [
  "open",
  "under_review",
  "closed",
]);

export const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof weekdays)[number];
export type MaterialSchedule = {
  materialType: string;
  timeWindow: string;
};
export type WeeklyMaterialCalendar = Partial<Record<Weekday, MaterialSchedule>>;

export const routes = pgTable(
  "routes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ward: varchar("ward", { length: 100 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    weeklyMaterialCalendar: jsonb("weekly_material_calendar")
      .$type<WeeklyMaterialCalendar>()
      .notNull(),
  },
  (table) => [uniqueIndex("routes_name_idx").on(table.name)],
);

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    addressLine: varchar("address_line", { length: 255 }).notNull(),
    ward: varchar("ward", { length: 100 }).notNull(),
    mockQrId: varchar("mock_qr_id", { length: 32 }).notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    routeId: uuid("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "restrict" }),
  },
  (table) => [
    uniqueIndex("properties_mock_qr_id_idx").on(table.mockQrId),
    index("properties_route_id_idx").on(table.routeId),
    index("properties_ward_idx").on(table.ward),
  ],
);

export const occupants = pgTable(
  "occupants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 24 }).notNull(),
    role: occupantRoleEnum("role").notNull(),
    moveInDate: date("move_in_date", { mode: "string" }).notNull(),
    moveOutDate: date("move_out_date", { mode: "string" }),
  },
  (table) => [
    uniqueIndex("occupants_phone_idx").on(table.phone),
    index("occupants_property_id_idx").on(table.propertyId),
  ],
);

export const collectionEvents = pgTable(
  "collection_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    routeId: uuid("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "restrict" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    eventDate: date("event_date", { mode: "string" }).notNull(),
    materialType: varchar("material_type", { length: 100 }).notNull(),
    timeWindow: varchar("time_window", { length: 80 }).notNull(),
    status: collectionStatusEnum("status").notNull().default("scheduled"),
  },
  (table) => [
    uniqueIndex("collection_events_property_date_idx").on(table.propertyId, table.eventDate),
    index("collection_events_route_date_idx").on(table.routeId, table.eventDate),
  ],
);

export const handoverLogs = pgTable(
  "handover_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occupantId: uuid("occupant_id")
      .notNull()
      .references(() => occupants.id, { onDelete: "cascade" }),
    collectionEventId: uuid("collection_event_id")
      .notNull()
      .references(() => collectionEvents.id, { onDelete: "cascade" }),
    residentMarkedAt: timestamp("resident_marked_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    collectorMarkedAt: timestamp("collector_marked_at", { mode: "date", withTimezone: true }),
    photoUrl: text("photo_url"),
    status: handoverStatusEnum("status").notNull().default("kept_out"),
  },
  (table) => [
    uniqueIndex("handover_logs_occupant_event_idx").on(
      table.occupantId,
      table.collectionEventId,
    ),
    index("handover_logs_collection_event_id_idx").on(table.collectionEventId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occupantId: uuid("occupant_id")
      .notNull()
      .references(() => occupants.id, { onDelete: "cascade" }),
    month: varchar("month", { length: 7 }).notNull(),
    amountInr: integer("amount_inr").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    receiptId: varchar("receipt_id", { length: 40 }).notNull(),
    paidAt: timestamp("paid_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("payments_occupant_month_idx").on(table.occupantId, table.month),
    uniqueIndex("payments_receipt_id_idx").on(table.receiptId),
  ],
);

export const grievances = pgTable(
  "grievances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occupantId: uuid("occupant_id")
      .notNull()
      .references(() => occupants.id, { onDelete: "cascade" }),
    handoverLogId: uuid("handover_log_id")
      .notNull()
      .references(() => handoverLogs.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    status: grievanceStatusEnum("status").notNull().default("open"),
    filedAt: timestamp("filed_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("grievances_occupant_id_idx").on(table.occupantId),
    index("grievances_handover_log_id_idx").on(table.handoverLogId),
  ],
);

export const routeRelations = relations(routes, ({ many }) => ({
  properties: many(properties),
  collectionEvents: many(collectionEvents),
}));

export const propertyRelations = relations(properties, ({ many, one }) => ({
  route: one(routes, { fields: [properties.routeId], references: [routes.id] }),
  occupants: many(occupants),
  collectionEvents: many(collectionEvents),
}));

export const occupantRelations = relations(occupants, ({ many, one }) => ({
  property: one(properties, { fields: [occupants.propertyId], references: [properties.id] }),
  handoverLogs: many(handoverLogs),
  payments: many(payments),
  grievances: many(grievances),
}));

export const collectionEventRelations = relations(collectionEvents, ({ many, one }) => ({
  route: one(routes, { fields: [collectionEvents.routeId], references: [routes.id] }),
  property: one(properties, {
    fields: [collectionEvents.propertyId],
    references: [properties.id],
  }),
  handoverLogs: many(handoverLogs),
}));

export const handoverLogRelations = relations(handoverLogs, ({ many, one }) => ({
  occupant: one(occupants, { fields: [handoverLogs.occupantId], references: [occupants.id] }),
  collectionEvent: one(collectionEvents, {
    fields: [handoverLogs.collectionEventId],
    references: [collectionEvents.id],
  }),
  grievances: many(grievances),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  occupant: one(occupants, { fields: [payments.occupantId], references: [occupants.id] }),
}));

export const grievanceRelations = relations(grievances, ({ one }) => ({
  occupant: one(occupants, { fields: [grievances.occupantId], references: [occupants.id] }),
  handoverLog: one(handoverLogs, {
    fields: [grievances.handoverLogId],
    references: [handoverLogs.id],
  }),
}));

export type Route = InferSelectModel<typeof routes>;
export type NewRoute = InferInsertModel<typeof routes>;
export type Property = InferSelectModel<typeof properties>;
export type NewProperty = InferInsertModel<typeof properties>;
export type Occupant = InferSelectModel<typeof occupants>;
export type NewOccupant = InferInsertModel<typeof occupants>;
export type CollectionEvent = InferSelectModel<typeof collectionEvents>;
export type NewCollectionEvent = InferInsertModel<typeof collectionEvents>;
export type HandoverLog = InferSelectModel<typeof handoverLogs>;
export type NewHandoverLog = InferInsertModel<typeof handoverLogs>;
export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;
export type Grievance = InferSelectModel<typeof grievances>;
export type NewGrievance = InferInsertModel<typeof grievances>;
