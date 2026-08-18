import { createHash } from "node:crypto";
import type {
  NewCollectionEvent,
  NewGrievance,
  NewHandoverLog,
  NewOccupant,
  NewPayment,
  NewProperty,
  NewRoute,
  Weekday,
} from "@/db/schema";

type SeedRoute = NewRoute & { id: string };
type SeedProperty = NewProperty & { id: string };
type SeedOccupant = NewOccupant & { id: string };
type SeedCollectionEvent = NewCollectionEvent & { id: string };
type SeedHandoverLog = NewHandoverLog & { id: string };
type SeedPayment = NewPayment & { id: string };
type SeedGrievance = NewGrievance & { id: string };

function stableUuid(key: string): string {
  const hex = createHash("sha256").update(`vandi-demo:${key}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function monthOffset(referenceDate: Date, months: number): string {
  const date = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + months, 1));
  return date.toISOString().slice(0, 7);
}

function weekdayFor(date: Date): Weekday {
  const weekdaysByIndex: readonly Weekday[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const weekday = weekdaysByIndex[date.getUTCDay()];
  if (!weekday) throw new Error("Unable to resolve weekday.");
  return weekday;
}

const baseCalendar = {
  monday: { materialType: "Plastic and dry waste", timeWindow: "7:30–9:00 AM" },
  wednesday: { materialType: "Food waste", timeWindow: "7:00–8:30 AM" },
  thursday: { materialType: "Plastic and dry waste", timeWindow: "7:30–9:00 AM" },
  saturday: { materialType: "Glass and metal", timeWindow: "8:00–9:30 AM" },
} satisfies NonNullable<NewRoute["weeklyMaterialCalendar"]>;

export function buildSeedData(referenceDate = new Date("2026-08-18T00:00:00.000Z")) {
  const routes: SeedRoute[] = [
    { id: stableUuid("route-elamkulam"), ward: "Elamkulam", name: "Demo Elamkulam North", weeklyMaterialCalendar: baseCalendar },
    { id: stableUuid("route-kadavanthra"), ward: "Kadavanthra", name: "Demo Kadavanthra Central", weeklyMaterialCalendar: baseCalendar },
    { id: stableUuid("route-panampilly"), ward: "Panampilly Nagar", name: "Demo Panampilly South", weeklyMaterialCalendar: baseCalendar },
    { id: stableUuid("route-thevara"), ward: "Thevara", name: "Demo Thevara East", weeklyMaterialCalendar: baseCalendar },
  ];

  const routeByWard = new Map(routes.map((route) => [route.ward, route.id] as const));
  const propertyDefinitions = [
    ["shared-lotus", "Demo Lotus House, Lane 1", "Elamkulam", "VN-EKM-01-1001", 9.9681, 76.2992],
    ["canal-view", "Demo Canal View, Lane 2", "Elamkulam", "VN-EKM-01-1002", 9.9692, 76.3011],
    ["mango-court", "Demo Mango Court, Lane 3", "Kadavanthra", "VN-EKM-02-1003", 9.9652, 76.3068],
    ["rain-tree", "Demo Rain Tree Home, Lane 4", "Kadavanthra", "VN-EKM-02-1004", 9.9637, 76.3049],
    ["harbour-nest", "Demo Harbour Nest, Lane 5", "Panampilly Nagar", "VN-EKM-03-1005", 9.9568, 76.2971],
    ["garden-court", "Demo Garden Court, Lane 6", "Panampilly Nagar", "VN-EKM-03-1006", 9.9583, 76.2958],
    ["backwater-view", "Demo Backwater View, Lane 7", "Thevara", "VN-EKM-04-1007", 9.9431, 76.2977],
    ["palm-house", "Demo Palm House, Lane 8", "Thevara", "VN-EKM-04-1008", 9.945, 76.3002],
  ] as const;

  const properties: SeedProperty[] = propertyDefinitions.map(
    ([key, addressLine, ward, mockQrId, latitude, longitude]) => {
      const routeId = routeByWard.get(ward);
      if (!routeId) throw new Error(`Missing demo route for ${ward}.`);
      return {
        id: stableUuid(`property-${key}`),
        addressLine,
        ward,
        mockQrId,
        latitude,
        longitude,
        routeId,
      };
    },
  );

  const propertyByKey = new Map(
    propertyDefinitions.map(([key], index) => [key, properties[index]?.id] as const),
  );
  const occupantDefinitions = [
    ["ravi", "shared-lotus", "Ravi Menon", "owner", "2019-04-01"],
    ["anjali", "shared-lotus", "Anjali Nair", "tenant", "2026-06-01"],
    ["neha", "shared-lotus", "Neha Thomas", "tenant", "2026-02-15"],
    ["arun", "canal-view", "Arun Das", "owner", "2021-08-10"],
    ["meera", "mango-court", "Meera Joseph", "tenant", "2025-11-01"],
    ["fathima", "mango-court", "Fathima Ali", "tenant", "2026-01-20"],
    ["vivek", "rain-tree", "Vivek Kumar", "owner", "2020-06-12"],
    ["diya", "harbour-nest", "Diya Paul", "tenant", "2026-03-05"],
    ["nimal", "harbour-nest", "Nimal Raj", "tenant", "2026-03-05"],
    ["latha", "garden-court", "Latha Krishnan", "owner", "2018-09-18"],
    ["sanjay", "backwater-view", "Sanjay Rao", "tenant", "2025-12-10"],
    ["asha", "palm-house", "Asha Balan", "owner", "2017-07-07"],
  ] as const;

  const occupants: SeedOccupant[] = occupantDefinitions.map(
    ([key, propertyKey, name, role, moveInDate], index) => {
      const propertyId = propertyByKey.get(propertyKey);
      if (!propertyId) throw new Error(`Missing demo property for ${propertyKey}.`);
      return {
        id: stableUuid(`occupant-${key}`),
        propertyId,
        name,
        phone: `+91-00000-${String(index + 1).padStart(5, "0")}`,
        role,
        moveInDate,
      };
    },
  );

  const occupantsByProperty = new Map<string, SeedOccupant[]>();
  for (const occupant of occupants) {
    const existing = occupantsByProperty.get(occupant.propertyId) ?? [];
    existing.push(occupant);
    occupantsByProperty.set(occupant.propertyId, existing);
  }

  const collectionEvents: SeedCollectionEvent[] = [];
  for (let offset = -20; offset <= 1; offset += 1) {
    const eventDate = addUtcDays(referenceDate, offset);
    const weekday = weekdayFor(eventDate);
    const schedule = baseCalendar[weekday as keyof typeof baseCalendar];
    if (!schedule) continue;

    for (const property of properties) {
      collectionEvents.push({
        id: stableUuid(`event-${property.id}-${isoDate(eventDate)}`),
        routeId: property.routeId,
        propertyId: property.id,
        eventDate: isoDate(eventDate),
        materialType: schedule.materialType,
        timeWindow: schedule.timeWindow,
        status: offset <= 0 ? "completed" : "scheduled",
      });
    }
  }

  const anjali = occupants.find((occupant) => occupant.name === "Anjali Nair");
  if (!anjali) throw new Error("Primary demo occupant is missing.");
  const anomalyDate = "2026-08-13";
  let anomalyHandoverId: string | undefined;

  const handoverLogs: SeedHandoverLog[] = collectionEvents
    .filter((event) => event.eventDate <= isoDate(referenceDate))
    .map((event) => {
      const propertyOccupants = occupantsByProperty.get(event.propertyId);
      const occupant =
        event.propertyId === anjali.propertyId
          ? anjali
          : propertyOccupants?.find((candidate) => candidate.role === "tenant") ?? propertyOccupants?.[0];
      if (!occupant) throw new Error(`Missing demo occupant for property ${event.propertyId}.`);

      const id = stableUuid(`handover-${occupant.id}-${event.id}`);
      const residentMarkedAt = new Date(`${event.eventDate}T02:05:00.000Z`);
      const isAnomaly = occupant.id === anjali.id && event.eventDate === anomalyDate;
      if (isAnomaly) anomalyHandoverId = id;

      return {
        id,
        occupantId: occupant.id,
        collectionEventId: event.id,
        residentMarkedAt,
        collectorMarkedAt: isAnomaly ? null : new Date(`${event.eventDate}T03:00:00.000Z`),
        status: isAnomaly ? "kept_out" : "collected",
      };
    });

  const payments: SeedPayment[] = occupants.flatMap((occupant, occupantIndex) =>
    [-2, -1, 0].map((monthDelta) => {
      const month = monthOffset(referenceDate, monthDelta);
      const pending = monthDelta === 0 && occupantIndex % 3 === 0;
      const serial = String(occupantIndex * 3 + monthDelta + 3).padStart(6, "0");
      return {
        id: stableUuid(`payment-${occupant.id}-${month}`),
        occupantId: occupant.id,
        month,
        amountInr: 80,
        status: pending ? "pending" : "paid",
        receiptId: `VN-RCP-${month.replace("-", "")}-${serial}`,
        paidAt: pending ? null : new Date(`${month}-05T05:30:00.000Z`),
      };
    }),
  );

  if (!anomalyHandoverId) throw new Error("The deliberate handover anomaly was not generated.");
  const grievances: SeedGrievance[] = [
    {
      id: stableUuid("grievance-anjali-missing-collector-mark"),
      occupantId: anjali.id,
      handoverLogId: anomalyHandoverId,
      description: "Resident marked the handover, but the collector confirmation is missing.",
      status: "open",
      filedAt: new Date("2026-08-13T06:30:00.000Z"),
    },
  ];

  return { routes, properties, occupants, collectionEvents, handoverLogs, payments, grievances };
}
