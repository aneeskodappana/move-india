import type { CollectionEvent, HandoverLog } from "@/db/schema";
import type { CollectorSession } from "@/lib/collector-session";
import type { Session } from "@/lib/session";
import { createHandoverService } from "@/services/handover.service";

const anjaliSession: Session = {
  version: 1,
  state: "registered",
  phone: "+91-00000-00002",
  name: "Anjali Nair",
  occupantId: "30000000-0000-4000-8000-000000000002",
  propertyId: "20000000-0000-4000-8000-000000000001",
  expiresAt: Date.now() + 60_000,
};
const collector: CollectorSession = { role: "collector", expiresAt: Date.now() + 60_000 };
const event: CollectionEvent = {
  id: "40000000-0000-4000-8000-000000000001",
  routeId: "10000000-0000-4000-8000-000000000001",
  propertyId: anjaliSession.state === "registered" ? anjaliSession.propertyId : "",
  eventDate: "2026-08-19",
  materialType: "Food waste",
  timeWindow: "7:00–8:30 AM",
  status: "scheduled",
};
const residentMarkedAt = new Date("2026-08-19T02:00:00.000Z");
const keptOut: HandoverLog = {
  id: "50000000-0000-4000-8000-000000000001",
  occupantId: anjaliSession.state === "registered" ? anjaliSession.occupantId : "",
  collectionEventId: event.id,
  residentMarkedAt,
  collectorMarkedAt: null,
  photoUrl: null,
  status: "kept_out",
};

function dependencies(overrides: {
  event?: CollectionEvent | null;
  existing?: HandoverLog | null;
} = {}) {
  return {
    collectionEvents: { findById: vi.fn().mockResolvedValue(overrides.event === undefined ? event : overrides.event) },
    handovers: {
      create: vi.fn().mockResolvedValue(keptOut),
      findByOccupantAndEvent: vi.fn().mockResolvedValue(overrides.existing ?? null),
      findById: vi.fn().mockResolvedValue(overrides.existing ?? keptOut),
      confirmCollected: vi.fn(),
      listPendingByDate: vi.fn().mockResolvedValue([]),
    },
  };
}

describe("HandoverService", () => {
  it("lets Anjali mark kept out for her own property and serializes the resident timestamp", async () => {
    const deps = dependencies();
    const service = createHandoverService(deps);
    await expect(service.markKeptOut(anjaliSession, { collectionEventId: event.id }, residentMarkedAt)).resolves.toEqual({
      id: keptOut.id,
      status: "kept_out",
      residentMarkedAt: residentMarkedAt.toISOString(),
      collectorMarkedAt: null,
      photoUrl: null,
    });
    expect(deps.handovers.create).toHaveBeenCalledWith(expect.objectContaining({ occupantId: keptOut.occupantId, collectionEventId: event.id }));
  });

  it("critically blocks Anjali from marking Ravi's or any other property handover", async () => {
    const raviEvent = { ...event, id: "40000000-0000-4000-8000-000000000002", propertyId: "20000000-0000-4000-8000-000000000002" };
    const deps = dependencies({ event: raviEvent });
    const service = createHandoverService(deps);
    await expect(service.markKeptOut(anjaliSession, { collectionEventId: raviEvent.id })).rejects.toMatchObject({ code: "forbidden", status: 403 });
    expect(deps.handovers.findByOccupantAndEvent).not.toHaveBeenCalled();
    expect(deps.handovers.create).not.toHaveBeenCalled();
  });

  it("returns the existing resident log when kept out is submitted twice", async () => {
    const deps = dependencies({ existing: keptOut });
    await createHandoverService(deps).markKeptOut(anjaliSession, { collectionEventId: event.id });
    expect(deps.handovers.create).not.toHaveBeenCalled();
  });

  it("lets only the collector side add its own timestamp", async () => {
    const collectorMarkedAt = new Date("2026-08-19T02:20:00.000Z");
    const collected = { ...keptOut, collectorMarkedAt, status: "collected" as const };
    const deps = dependencies({ existing: keptOut });
    deps.handovers.confirmCollected.mockResolvedValue(collected);
    await expect(createHandoverService(deps).confirmCollected(collector, { handoverLogId: keptOut.id }, collectorMarkedAt)).resolves.toMatchObject({
      status: "collected",
      collectorMarkedAt: collectorMarkedAt.toISOString(),
    });
    expect(deps.handovers.confirmCollected).toHaveBeenCalledWith(keptOut.id, collectorMarkedAt);
  });

  it("lists the pending collector queue with transport-safe timestamps", async () => {
    const deps = dependencies();
    deps.handovers.listPendingByDate.mockResolvedValue([{
      id: keptOut.id,
      residentName: "Anjali Nair",
      addressLine: "Demo Lotus House, Lane 1",
      ward: "Elamkulam",
      routeName: "Demo Elamkulam North",
      materialType: "Food waste",
      timeWindow: "7:00–8:30 AM",
      residentMarkedAt,
      photoUrl: null,
    }]);
    await expect(createHandoverService(deps).listPendingCollector(collector, "2026-08-19")).resolves.toMatchObject([{ residentMarkedAt: residentMarkedAt.toISOString() }]);
  });
});
