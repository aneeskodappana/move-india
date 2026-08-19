import type { CollectionEvent, Property, Route } from "@/db/schema";
import type { Session } from "@/lib/session";
import { createTodayService } from "@/services/today.service";

const registeredSession: Session = {
  version: 1,
  state: "registered",
  phone: "+91-00000-00002",
  name: "Anjali Nair",
  occupantId: "30000000-0000-4000-8000-000000000002",
  propertyId: "20000000-0000-4000-8000-000000000001",
  expiresAt: Date.now() + 60_000,
};
const property: Property = {
  id: registeredSession.propertyId,
  addressLine: "Demo Lotus House, Lane 1",
  ward: "Elamkulam",
  mockQrId: "VN-EKM-01-1001",
  latitude: 9.9681,
  longitude: 76.2992,
  routeId: "10000000-0000-4000-8000-000000000001",
};
const route: Route = {
  id: property.routeId,
  ward: "Elamkulam",
  name: "Demo Elamkulam North",
  weeklyMaterialCalendar: {},
};
const event: CollectionEvent = {
  id: "40000000-0000-4000-8000-000000000001",
  routeId: route.id,
  propertyId: property.id,
  eventDate: "2026-08-19",
  materialType: "Food waste",
  timeWindow: "7:00–8:30 AM",
  status: "scheduled",
};

describe("TodayService", () => {
  it("resolves the resident property, route, event, and canonical message", async () => {
    const composeScheduleMessage = vi.fn().mockReturnValue("Canonical update");
    const service = createTodayService({
      broadcasts: { composeScheduleMessage },
      collectionEvents: { findByPropertyAndDate: vi.fn().mockResolvedValue(event) },
      properties: { findById: vi.fn().mockResolvedValue(property) },
      routes: { findById: vi.fn().mockResolvedValue(route) },
    });

    await expect(service.getForResident(registeredSession, "2026-08-19")).resolves.toMatchObject({
      property: { addressLine: property.addressLine },
      route: { name: route.name },
      collection: { materialType: "Food waste", timeWindow: "7:00–8:30 AM" },
      message: "Canonical update",
    });
    expect(composeScheduleMessage).toHaveBeenCalledWith({
      address: property.addressLine,
      date: "2026-08-19",
      materialType: "Food waste",
      timeWindow: "7:00–8:30 AM",
    });
  });

  it("blocks a verified identity that has not joined a property", async () => {
    const service = createTodayService({
      broadcasts: { composeScheduleMessage: vi.fn() },
      collectionEvents: { findByPropertyAndDate: vi.fn() },
      properties: { findById: vi.fn() },
      routes: { findById: vi.fn() },
    });
    await expect(service.getForResident({
      version: 1,
      state: "verified",
      phone: "+91-00000-12345",
      name: "New Resident",
      expiresAt: Date.now() + 60_000,
    }, "2026-08-19")).rejects.toThrow("Join a property");
  });
});
