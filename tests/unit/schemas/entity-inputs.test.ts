import {
  createCollectionEventInputSchema,
  createGrievanceInputSchema,
  createHandoverLogInputSchema,
  createOccupantInputSchema,
  createPaymentInputSchema,
  createPropertyInputSchema,
  createRouteInputSchema,
} from "@/schemas";

const ids = {
  route: "10000000-0000-4000-8000-000000000001",
  property: "20000000-0000-4000-8000-000000000001",
  occupant: "30000000-0000-4000-8000-000000000001",
  event: "40000000-0000-4000-8000-000000000001",
  handover: "50000000-0000-4000-8000-000000000001",
};

describe("entity input schemas", () => {
  it("accepts a route and independent synthetic property identifier", () => {
    expect(
      createRouteInputSchema.safeParse({
        ward: "Elamkulam",
        name: "Demo Elamkulam North",
        weeklyMaterialCalendar: {},
      }).success,
    ).toBe(true);
    expect(
      createPropertyInputSchema.safeParse({
        routeId: ids.route,
        addressLine: "Demo Lotus House, Lane 1",
        ward: "Elamkulam",
        mockQrId: "VN-EKM-01-1001",
        latitude: 9.968,
        longitude: 76.299,
      }).success,
    ).toBe(true);
  });

  it("rejects real-looking phones and impossible occupancy dates", () => {
    const result = createOccupantInputSchema.safeParse({
      propertyId: ids.property,
      name: "Anjali Nair",
      phone: "+91-98765-43210",
      role: "tenant",
      moveInDate: "2026-06-01",
      moveOutDate: "2026-05-01",
    });
    expect(result.success).toBe(false);
  });

  it("defaults a valid collection event to scheduled", () => {
    const value = createCollectionEventInputSchema.parse({
      routeId: ids.route,
      propertyId: ids.property,
      eventDate: "2026-08-18",
      materialType: "Plastic and dry waste",
      timeWindow: "7:30–9:00 AM",
    });
    expect(value.status).toBe("scheduled");
  });

  it("rejects a collector timestamp earlier than the resident timestamp", () => {
    const result = createHandoverLogInputSchema.safeParse({
      occupantId: ids.occupant,
      collectionEventId: ids.event,
      residentMarkedAt: "2026-08-18T03:00:00.000Z",
      collectorMarkedAt: "2026-08-18T02:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("requires a paid timestamp for a successful mock payment", () => {
    const result = createPaymentInputSchema.safeParse({
      occupantId: ids.occupant,
      month: "2026-08",
      amountInr: 80,
      status: "paid",
      receiptId: "VN-RCP-202608-000001",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a grievance tied to the handover evidence", () => {
    expect(
      createGrievanceInputSchema.safeParse({
        occupantId: ids.occupant,
        handoverLogId: ids.handover,
        description: "Collector confirmation is missing from this record.",
      }).success,
    ).toBe(true);
  });
});
