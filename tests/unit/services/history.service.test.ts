import type { CollectionEvent, HandoverLog, Payment, Property } from "@/db/schema";
import type { Session } from "@/lib/session";
import { createHistoryService } from "@/services/history.service";

const anjaliSession: Session = {
  version: 1,
  state: "registered",
  phone: "+91-00000-00002",
  name: "Anjali Nair",
  occupantId: "30000000-0000-4000-8000-000000000002",
  propertyId: "20000000-0000-4000-8000-000000000001",
  expiresAt: Date.now() + 60_000,
};
const property: Property = {
  id: anjaliSession.propertyId,
  addressLine: "Demo Lotus House, Lane 1",
  ward: "Elamkulam",
  mockQrId: "VN-EKM-01-1001",
  latitude: 9.9681,
  longitude: 76.2992,
  routeId: "10000000-0000-4000-8000-000000000001",
};
const gapEvent: CollectionEvent = {
  id: "40000000-0000-4000-8000-000000000013",
  routeId: property.routeId,
  propertyId: property.id,
  eventDate: "2026-08-13",
  materialType: "Food waste",
  timeWindow: "7:00–8:30 AM",
  status: "completed",
};
const laterEvent: CollectionEvent = {
  id: "40000000-0000-4000-8000-000000000018",
  routeId: property.routeId,
  propertyId: property.id,
  eventDate: "2026-08-18",
  materialType: "Plastic and dry waste",
  timeWindow: "7:30–9:00 AM",
  status: "completed",
};
const julyEvent: CollectionEvent = {
  id: "40000000-0000-4000-8000-000000000007",
  routeId: property.routeId,
  propertyId: property.id,
  eventDate: "2026-07-15",
  materialType: "Food waste",
  timeWindow: "7:00–8:30 AM",
  status: "completed",
};
const gapLog: HandoverLog = {
  id: "50000000-0000-4000-8000-000000000013",
  occupantId: anjaliSession.occupantId,
  collectionEventId: gapEvent.id,
  residentMarkedAt: new Date("2026-08-13T02:05:00.000Z"),
  collectorMarkedAt: null,
  photoUrl: null,
  status: "kept_out",
};
const collectedLog: HandoverLog = {
  id: "50000000-0000-4000-8000-000000000018",
  occupantId: anjaliSession.occupantId,
  collectionEventId: laterEvent.id,
  residentMarkedAt: new Date("2026-08-18T02:05:00.000Z"),
  collectorMarkedAt: new Date("2026-08-18T03:00:00.000Z"),
  photoUrl: null,
  status: "collected",
};
const augustPayment: Payment = {
  id: "60000000-0000-4000-8000-000000000008",
  occupantId: anjaliSession.occupantId,
  month: "2026-08",
  amountInr: 80,
  status: "paid",
  receiptId: "VN-RCP-202608-000006",
  paidAt: new Date("2026-08-05T05:30:00.000Z"),
};
const julyPayment: Payment = {
  id: "60000000-0000-4000-8000-000000000007",
  occupantId: anjaliSession.occupantId,
  month: "2026-07",
  amountInr: 80,
  status: "paid",
  receiptId: "VN-RCP-202607-000005",
  paidAt: new Date("2026-07-05T05:30:00.000Z"),
};

function dependencies() {
  return {
    collectionEvents: { listByProperty: vi.fn().mockResolvedValue([laterEvent, gapEvent, julyEvent]) },
    handovers: { listByOccupant: vi.fn().mockResolvedValue([collectedLog, gapLog]) },
    payments: { listByOccupant: vi.fn().mockResolvedValue([augustPayment, julyPayment]) },
    properties: { findById: vi.fn().mockResolvedValue(property) },
  };
}

describe("HistoryService", () => {
  it("combines handover timestamps and payment receipts into one proof pack", async () => {
    const deps = dependencies();
    const pack = await createHistoryService(deps).getProofPack(anjaliSession, undefined, new Date("2026-08-19T05:30:00.000Z"));
    expect(deps.handovers.listByOccupant).toHaveBeenCalledWith(anjaliSession.occupantId);
    expect(deps.collectionEvents.listByProperty).toHaveBeenCalledWith(anjaliSession.propertyId);
    expect(pack.collections[0]).toMatchObject({
      eventDate: "2026-08-18",
      materialType: "Plastic and dry waste",
      handover: {
        status: "collected",
        collectorMarkedAt: collectedLog.collectorMarkedAt?.toISOString(),
      },
    });
    const gap = pack.collections.find((entry) => entry.eventDate === "2026-08-13");
    expect(gap?.handover).toMatchObject({ status: "kept_out", collectorMarkedAt: null });
    expect(pack.payments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ receiptId: "VN-RCP-202608-000006", status: "paid" }),
      ]),
    );
  });

  it("filters the proof pack to a single month", async () => {
    const pack = await createHistoryService(dependencies()).getProofPack(
      anjaliSession,
      "2026-08",
      new Date("2026-08-19T05:30:00.000Z"),
    );
    expect(pack.month).toBe("2026-08");
    expect(pack.collections.every((entry) => entry.eventDate.startsWith("2026-08"))).toBe(true);
    expect(pack.payments).toHaveLength(1);
    expect(pack.payments[0]?.month).toBe("2026-08");
    expect(pack.months).toEqual(["2026-08", "2026-07"]);
  });

  it("blocks a verified identity that has not joined a property", async () => {
    const deps = dependencies();
    await expect(
      createHistoryService(deps).getProofPack({
        version: 1,
        state: "verified",
        phone: "+91-00000-12345",
        name: "New Resident",
        expiresAt: Date.now() + 60_000,
      }),
    ).rejects.toMatchObject({ code: "forbidden", status: 403 });
    expect(deps.handovers.listByOccupant).not.toHaveBeenCalled();
  });
});
